import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GenerateContentResponse } from "@google/genai";
import { Message, Sender, Theme } from './types';
import { sendMessageToGeminiStream } from './services/geminiService';
import Scanlines from './components/Scanlines';
import Header from './components/Header';
import MessageItem from './components/MessageItem';
import BootScreen from './components/BootScreen';

const App: React.FC = () => {
  // --- APP STATE ---
  // Always boot on load so the animation is visible (removed sessionStorage check)
  const [isBooting, setIsBooting] = useState(true);

  const [theme, setTheme] = useState<Theme>('retro');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      text: 'INITIALIZING SYSTEM...\nCONNECTION ESTABLISHED.\nAWAITING INPUT...',
      sender: Sender.SYSTEM,
      timestamp: new Date()
    }
  ]);
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
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShouldAutoScroll(isNearBottom);
    }
  };

  useEffect(() => {
    if (shouldAutoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  // --- SYSTEM CHECKS ---
  useEffect(() => {
    if (!isBooting) {
      // Check if API Key was injected during build.
      // process.env.API_KEY is replaced by a string literal in vite.config.ts
      const apiKey = process.env.API_KEY;
      
      if (!apiKey || apiKey.trim() === '') {
        setMessages(prev => [...prev, {
          id: 'sys-error-no-key',
          text: 'FATAL ERROR: API_KEY MISSING.\nDEPLOYMENT CONFIGURATION INCOMPLETE.\nPLEASE SET API_KEY IN CLOUDFLARE SETTINGS.',
          sender: Sender.SYSTEM,
          timestamp: new Date()
        }]);
      }
    }
  }, [isBooting]);

  // --- TYPEWRITER LOOP ---
  useEffect(() => {
    if (isProcessing && isTypewriterActive.current) {
      typingIntervalRef.current = window.setInterval(() => {
        if (streamingBuffer.current.length > 0) {
          const bufferLen = streamingBuffer.current.length;
          const charsToTake = bufferLen > 100 ? 5 : bufferLen > 30 ? 2 : 1;
          
          const chunk = streamingBuffer.current.slice(0, charsToTake);
          streamingBuffer.current = streamingBuffer.current.slice(charsToTake);

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
      }, 20);
    }
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [isProcessing]);

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

    const userText = inputValue;
    const command = userText.trim().toLowerCase();

    // --- COMMAND: CLEAR ---
    if (command === 'clear') {
      setInputValue('');
      setMessages([]);
      return;
    }

    // --- COMMAND: SUDO RM -RF ---
    if (command === 'sudo rm -rf' || command.startsWith('sudo rm -rf')) {
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
        { text: 'DELETING /home...', delay: 3400 },
        { text: 'DELETING /var...', delay: 3800 },
        { text: 'CRITICAL ERROR: KERNEL PANIC. SYSTEM HALTED.', delay: 4800 }
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
          text: 'SYSTEM REBOOT...\nINITIALIZING SYSTEM...\nCONNECTION ESTABLISHED.\nAWAITING INPUT...',
          sender: Sender.SYSTEM,
          timestamp: new Date()
        }]);
        setIsProcessing(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }, 7000);

      return;
    }
    
    // --- COMMAND: NEOFETCH ---
    if (command === 'neofetch') {
      setInputValue('');
      
      const neofetchArt = `
       /\\
      /  \\      OS: EndeavourOS Linux x86_64
     /    \\     Host: Gemini Virtual Terminal
    /      \\    Kernel: 6.6.1-arch1-1
   /________\\   Uptime: 42 mins
  /__________\\  Packages: 1337 (pacman)
 /            \\ Shell: zsh 5.9
/______________\\ Resolution: 1920x1080
      `;

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: userText,
          sender: Sender.USER,
          timestamp: new Date()
        },
        {
          id: `sys-${Date.now()}`,
          text: neofetchArt,
          sender: Sender.SYSTEM,
          timestamp: new Date()
        }
      ]);
      setShouldAutoScroll(true);
      return;
    }

    // --- NORMAL AI CHAT ---
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
      streamingBuffer.current += `\n[ERROR: SYSTEM FAILURE - ${error instanceof Error ? error.message : 'UNKNOWN'}]`;
    } finally {
      isNetworkStreaming.current = false;
    }
  }, [inputValue, isProcessing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
      if (!e.shiftKey) {
        e.preventDefault();
        setInputValue(prev => prev + '^V');
      }
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'retro' ? 'clean' : 'retro');
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

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden relative ${containerClass}`}>
      {isRetro && <Scanlines />}
      
      <Header theme={theme} onToggleTheme={toggleTheme} />
      
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
            <span className={`animate-pulse ${isRetro ? 'text-green-500' : 'text-gray-500'}`}>
              {isRetro ? '>' : '>>'}
            </span>
            {isProcessing && (
              <span className={`ml-2 text-sm animate-pulse ${isRetro ? 'text-green-700' : 'text-gray-600'}`}>
                loading...
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
            placeholder="ENTER COMMAND..."
            autoFocus
            disabled={false}
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
};

export default App;