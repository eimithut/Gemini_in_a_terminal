
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GenerateContentResponse } from "@google/genai";
import { Message, Sender, Theme, ChatMode } from './types';
import { sendMessageToGeminiStream, switchChatMode } from './services/geminiService';
import Scanlines from './components/Scanlines';
import Header from './components/Header';
import MessageItem from './components/MessageItem';
import BootScreen from './components/BootScreen';
import { playKeystrokeSound, playIncomingDataSound, toggleMute } from './utils/audio';
import { executeFileSystemCommand, getFileSystemCompletions } from './utils/fileSystem';

const App: React.FC = () => {
  // --- APP STATE ---
  // Always boot on load so the animation is visible
  const [isBooting, setIsBooting] = useState(true);

  const [theme, setTheme] = useState<Theme>('retro');
  const [chatMode, setChatMode] = useState<ChatMode>('terminal');
  const [isMuted, setIsMuted] = useState(false);
  
  // --- FILESYSTEM STATE ---
  const [currentPath, setCurrentPath] = useState('/home/operator');

  // --- COMMAND HISTORY STATE ---
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // --- MESSAGES STATE (NO PERSISTENCE) ---
  const [messages, setMessages] = useState<Message[]>([{
    id: 'init-1',
    text: 'INITIALIZING ENDEAVOUR_OS COMPATIBILITY LAYER...\nCONNECTION ESTABLISHED.\nAWAITING INPUT...',
    sender: Sender.SYSTEM,
    timestamp: new Date()
  }]);

  const [inputValue, setInputValue] = useState('');
  
  // State to track if the system is "busy"
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Ref for the main scrollable container
  const scrollContainerRef = useRef<HTMLElement>(null);
  // Ref for the dummy element at the bottom
  const bottomRef = useRef<HTMLDivElement>(null);
  // State to track if we should auto-scroll
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter Effect Refs
  const streamingBuffer = useRef<string>(""); 
  const isNetworkStreaming = useRef(false); 
  const typingIntervalRef = useRef<number | null>(null);
  const isTypewriterActive = useRef(false); 

  // --- CHAT SCROLL LOGIC ---
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // If user is within 50px of bottom, auto-scroll is enabled
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShouldAutoScroll(isNearBottom);
    }
  };

  useEffect(() => {
    if (shouldAutoScroll && bottomRef.current) {
      // Use 'auto' (instant) scrolling when processing to prevent lag behind the typing animation.
      // Use 'smooth' only for user inputs or system events when not rapidly typing.
      bottomRef.current.scrollIntoView({ behavior: isProcessing ? 'auto' : 'smooth' });
    }
  }, [messages, shouldAutoScroll, isProcessing]);

  // --- SYSTEM CHECKS ---
  useEffect(() => {
    if (!isBooting) {
      // Check if API Key was injected during build.
      const apiKey = process.env.API_KEY;
      
      if (!apiKey || apiKey.trim() === '') {
        setMessages(prev => [...prev, {
          id: 'sys-error-no-key',
          text: 'FATAL ERROR: API_KEY MISSING.\nDEPLOYMENT CONFIGURATION INCOMPLETE.\nPLEASE SET API_KEY IN CLOUDFLARE SETTINGS.',
          sender: Sender.SYSTEM,
          timestamp: new Date()
        }]);
      } else {
        // Initialize Gemini with default mode
        switchChatMode('terminal');
      }
    }
  }, [isBooting]);

  // --- TYPEWRITER LOOP ---
  useEffect(() => {
    if (isProcessing && isTypewriterActive.current) {
      // Counter to throttle sound effects (don't play on every 20ms tick)
      let tickCount = 0;

      typingIntervalRef.current = window.setInterval(() => {
        if (streamingBuffer.current.length > 0) {
          const bufferLen = streamingBuffer.current.length;
          
          // SPEED CONTROL:
          const charsToTake = bufferLen > 150 ? 3 : bufferLen > 50 ? 2 : 1;
          
          const chunk = streamingBuffer.current.slice(0, charsToTake);
          streamingBuffer.current = streamingBuffer.current.slice(charsToTake);

          // SOUND: Play incoming data sound occasionally (every ~3 ticks) or if a large chunk
          tickCount++;
          if (tickCount % 3 === 0) {
             playIncomingDataSound();
          }

          setMessages(prev => {
            const newArr = [...prev];
            const lastIdx = newArr.length - 1;
            if (lastIdx >= 0 && newArr[lastIdx].isStreaming) {
              newArr[lastIdx] = { 
                ...newArr[lastIdx], 
                text: newArr[lastIdx].text + chunk 
              };
            }
            return newArr;
          });

          // FORCE SCROLL TO BOTTOM
          if (shouldAutoScroll && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }

        } 
        else if (!isNetworkStreaming.current && streamingBuffer.current.length === 0) {
          setIsProcessing(false);
          setMessages(prev => {
            const newArr = [...prev];
            const lastIdx = newArr.length - 1;
            if (lastIdx >= 0 && newArr[lastIdx].isStreaming) {
              newArr[lastIdx] = { ...newArr[lastIdx], isStreaming: false };
            }
            return newArr;
          });
          if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      }, 20); // 20ms interval (50fps)
    }
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [isProcessing, shouldAutoScroll]);

  // Focus main input on click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isBooting) return; // Don't focus during boot
      if (window.getSelection()?.toString().length ?? 0 > 0) return;
      if (e.target instanceof Element && (e.target.tagName === 'BUTTON' || e.target.closest('button'))) {
        return;
      }
      inputRef.current?.focus();
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isBooting]);

  // --- MESSAGE HANDLER ---
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) return;

    // Play keystroke on enter
    playKeystrokeSound();

    const userText = inputValue;
    const command = userText.trim();
    const commandLower = command.toLowerCase();

    // 1. ADD TO HISTORY
    setHistory(prev => {
        const newHistory = [...prev, userText];
        // Keep history size manageable (e.g., 50 commands)
        if (newHistory.length > 50) return newHistory.slice(newHistory.length - 50);
        return newHistory;
    });
    setHistoryIndex(-1); // Reset index

    // --- LOCAL COMMAND: CLEAR ---
    if (commandLower === 'clear') {
      setInputValue('');
      setMessages([]);
      return;
    }

    // --- LOCAL COMMAND: RBX HUNT ---
    if (commandLower === 'rbx hunt') {
        setInputValue('');
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: userText,
            sender: Sender.USER,
            timestamp: new Date()
        }]);
        setShouldAutoScroll(true);

        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: `rbx-${Date.now()}`,
                text: '>>> SCAVENGER HUNT INITIATED <<<\n\nOBJECTIVE: Locate the encrypted reward file hidden within the filesystem.\n\nINSTRUCTIONS:\n1. Use "ls" to list files in the current directory.\n2. Use "cd [folder_name]" to navigate folders.\n3. Use "cd .." to go back up one level.\n4. Use "cat [filename]" to read files.\n\nHINT: The prize is buried deep. Check system configurations or logs. Beware of fake winning folders.',
                sender: Sender.SYSTEM,
                timestamp: new Date()
            }]);
            setShouldAutoScroll(true);
        }, 100);
        return;
    }

    // --- LOCAL COMMAND: FILESYSTEM (ls, cd, cat, pwd, whoami) ---
    const fsResult = executeFileSystemCommand(command, currentPath);
    if (fsResult) {
      setInputValue('');
      
      // Add User Message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: userText,
        sender: Sender.USER,
        timestamp: new Date()
      }]);
      setShouldAutoScroll(true);

      // Add System Response (FileSystem Output)
      if (fsResult.output) {
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: `fs-${Date.now()}`,
                text: fsResult.output,
                sender: Sender.SYSTEM,
                timestamp: new Date()
            }]);
            setShouldAutoScroll(true);
        }, 100);
      }
      
      // Update Directory if 'cd' was successful
      if (fsResult.newPath) {
        const newDir = fsResult.newPath;
        setCurrentPath(newDir);

        // AUTO-LS LOGIC: If command was cd, run ls automatically after 1 second
        if (commandLower === 'cd' || commandLower.startsWith('cd ')) {
            setTimeout(() => {
                const lsResult = executeFileSystemCommand('ls', newDir);
                if (lsResult && lsResult.output) {
                    setMessages(prev => [...prev, {
                        id: `auto-ls-${Date.now()}`,
                        text: lsResult.output,
                        sender: Sender.SYSTEM,
                        timestamp: new Date()
                    }]);
                    setShouldAutoScroll(true);
                }
            }, 1000);
        }
      }

      return; // Stop here, don't send to Gemini
    }

    // --- LOCAL COMMAND: SUDO RM -RF (Easter Egg) ---
    if (commandLower === 'sudo rm -rf' || commandLower.startsWith('sudo rm -rf /')) {
      setInputValue('');
      setIsProcessing(true);
      isTypewriterActive.current = false; 

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: userText,
        sender: Sender.USER,
        timestamp: new Date()
      }]);
      setShouldAutoScroll(true);

      const sequence = [
        { text: 'AUTHENTICATING ROOT...', delay: 600 },
        { text: 'ACCESS GRANTED.', delay: 1200 },
        { text: 'DELETING /bin...', delay: 1800 },
        { text: 'DELETING /usr...', delay: 2400 },
        { text: 'DELETING /etc...', delay: 2900 },
        { text: 'CRITICAL ERROR: KERNEL PANIC. SYSTEM HALTED.', delay: 3500 }
      ];

      sequence.forEach(({ text, delay }) => {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: `sys-${Date.now()}-${Math.random()}`,
            text: text,
            sender: Sender.SYSTEM,
            timestamp: new Date()
          }]);
          setShouldAutoScroll(true);
        }, delay);
      });

      setTimeout(() => {
        setMessages([{
          id: 'reboot-1',
          text: 'SYSTEM REBOOT...\nINITIALIZING SYSTEM...\nCONNECTION ESTABLISHED.',
          sender: Sender.SYSTEM,
          timestamp: new Date()
        }]);
        setIsProcessing(false);
        setCurrentPath('/home/operator'); // Reset path on "reboot"
        setTimeout(() => inputRef.current?.focus(), 100);
      }, 5000);

      return;
    }
    
    // --- SEND TO AI (Handles 'yay', 'neofetch', normal chat, etc.) ---
    setInputValue('');
    setIsProcessing(true);
    isNetworkStreaming.current = true;
    isTypewriterActive.current = true;
    streamingBuffer.current = ""; 

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: Sender.USER,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setShouldAutoScroll(true); 

    const aiMessageId = (Date.now() + 1).toString();
    const aiPlaceholder: Message = {
      id: aiMessageId,
      text: '', 
      sender: Sender.AI,
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, aiPlaceholder]);

    try {
      const stream = await sendMessageToGeminiStream(userText);
      for await (const chunk of stream) {
        const chunkText = (chunk as GenerateContentResponse).text || '';
        streamingBuffer.current += chunkText;
      }
    } catch (error) {
      streamingBuffer.current += `\n[ERROR: CONNECTION FAILED - ${error instanceof Error ? error.message : 'UNKNOWN'}]`;
    } finally {
      isNetworkStreaming.current = false;
    }
  }, [inputValue, isProcessing, currentPath]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 1. SEND MESSAGE
    if (e.key === 'Enter') {
      handleSendMessage();
      return;
    }

    // 2. HISTORY NAVIGATION (UP)
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (history.length > 0) {
            // If starting fresh, point to last element
            const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
            setHistoryIndex(newIndex);
            setInputValue(history[newIndex]);
        }
        return;
    }

    // 3. HISTORY NAVIGATION (DOWN)
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex !== -1) {
            const newIndex = Math.min(history.length - 1, historyIndex + 1);
            // If we go past the last item, clear input (new command)
            if (newIndex === history.length - 1 && historyIndex === history.length - 1) {
                 setHistoryIndex(-1);
                 setInputValue('');
            } else {
                 setHistoryIndex(newIndex);
                 setInputValue(history[newIndex]);
            }
        }
        return;
    }

    // 4. TAB AUTOCOMPLETE
    if (e.key === 'Tab') {
        e.preventDefault();
        // Extract the last word to autocomplete
        const parts = inputValue.split(' ');
        const partial = parts[parts.length - 1];
        
        // If typing a command like 'cd Do', partial is 'Do'
        if (partial.length > 0) {
            const matches = getFileSystemCompletions(partial, currentPath);
            if (matches.length === 1) {
                // Complete it
                const completed = matches[0];
                parts[parts.length - 1] = completed;
                setInputValue(parts.join(' '));
            } else if (matches.length > 1) {
                // Play a sound or show valid options (optional, sticking to simple behavior)
                // Just complete common prefix could be added, but simplest is ignore for now
            }
        }
        return;
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'retro' ? 'clean' : 'retro');
  };

  const toggleMode = () => {
    const newMode = chatMode === 'terminal' ? 'assistant' : 'terminal';
    setChatMode(newMode);
    switchChatMode(newMode);
    
    const modeDisplayName = newMode === 'terminal' ? 'ENDEAVOUR_OS' : 'GEMINI_LINK';
    const modeLoadingMsg = newMode === 'terminal' ? 'LOADING SHELL ENVIRONMENT...' : 'ESTABLISHING NEURAL LINK...';
    
    const sysMsg: Message = {
      id: `sys-mode-${Date.now()}`,
      text: `SWITCHING SYSTEM TO: ${modeDisplayName}...\n${modeLoadingMsg}`,
      sender: Sender.SYSTEM,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, sysMsg]);
  };

  const handleToggleMute = () => {
      const newState = !isMuted;
      setIsMuted(newState);
      toggleMute(newState);
  };

  const isRetro = theme === 'retro';
  
  // --- BOOT SCREEN CHECK ---
  if (isBooting) {
    return <BootScreen onComplete={() => setIsBooting(false)} />;
  }

  // --- MAIN APP RENDER ---
  const containerClass = isRetro 
    ? "bg-black text-green-500 font-terminal crt-flicker selection:bg-green-500 selection:text-black" 
    : "bg-black text-gray-300 font-terminal selection:bg-gray-600 selection:text-white";
  
  const inputClass = isRetro
    ? "bg-transparent border-none outline-none text-green-500 placeholder-green-800 flex-1 min-w-0"
    : "bg-transparent border-none outline-none text-gray-300 placeholder-gray-600 flex-1 min-w-0";

  // Prompt Text Logic
  let promptText = "";
  if (chatMode === 'terminal') {
    // Dynamic Path Prompt
    const displayPath = currentPath.startsWith('/home/operator') 
      ? '~' + currentPath.slice(14) 
      : currentPath;
    promptText = `root@eos ${displayPath} #`;
  } else {
    promptText = "gemini@core ~ >";
  }

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden relative ${containerClass}`}>
      {isRetro && <Scanlines />}
      
      <Header 
        theme={theme} 
        mode={chatMode} 
        isMuted={isMuted}
        onToggleTheme={toggleTheme} 
        onToggleMode={toggleMode}
        onToggleMute={handleToggleMute}
      />
      
      <main 
        className="flex-1 overflow-y-auto p-4 sm:p-8 pb-0 z-10 scrollbar-hide" 
        onClick={() => inputRef.current?.focus()}
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-end">
          {messages.map(msg => (
            <MessageItem key={msg.id} message={msg} theme={theme} />
          ))}
          <div ref={bottomRef} className="h-4" />
        </div>
      </main>

      <div className="p-4 sm:p-8 pt-2 z-20 sticky bottom-0 bg-transparent">
        <div className={`max-w-4xl mx-auto flex items-center ${isRetro ? 'border-t border-green-900' : 'border-t border-gray-800'} pt-4`}>
          <div className="flex items-center mr-4 shrink-0">
            <span className={`animate-pulse whitespace-nowrap ${isRetro ? 'text-green-500' : 'text-gray-500'}`}>
              {promptText}
            </span>
            {isProcessing && (
              <span className={`ml-2 text-sm animate-pulse ${isRetro ? 'text-green-700' : 'text-gray-600'}`}>
                {chatMode === 'terminal' ? 'executing...' : 'thinking...'}
              </span>
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`text-xl sm:text-2xl ${inputClass}`}
            placeholder={chatMode === 'terminal' ? "enter command..." : "send message..."}
            autoFocus
            disabled={false}
            autoComplete="off"
            spellCheck="false"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
      </div>
    </div>
  );
};

export default App;
