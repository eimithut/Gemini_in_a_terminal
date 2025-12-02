
import React, { useState, useEffect } from 'react';
import { Theme, ChatMode } from '../types';

interface HeaderProps {
  theme: Theme;
  mode: ChatMode;
  isMuted: boolean;
  onToggleTheme: () => void;
  onToggleMode: () => void;
  onToggleMute: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, mode, isMuted, onToggleTheme, onToggleMode, onToggleMute }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Use 'de-DE' locale for German date format (Day.Month.Year)
  const formattedDate = time.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const formattedTime = time.toLocaleTimeString('en-US', { hour12: false });

  const isRetro = theme === 'retro';
  const isTerminal = mode === 'terminal';

  // Dynamic Titles based on Mode
  const desktopTitlePart1 = isTerminal ? 'ENDEAVOUR' : 'GEMINI';
  const desktopTitlePart2 = isTerminal ? 'OS' : 'LINK';
  const mobileTitle = isTerminal ? 'EOS_TERM' : 'AI_LINK';

  // Fancy Display Names for Buttons
  const modeDisplayName = isTerminal ? 'ENDEAVOUR_OS' : 'GEMINI_LINK';
  // Shorter display for mobile
  const modeMobileName = isTerminal ? 'EOS' : 'AI';

  return (
    <div className={`border-b-2 p-2 sm:p-4 flex flex-wrap justify-between items-center select-none sticky top-0 z-40 transition-all duration-300
      ${isRetro ? 'bg-black bg-opacity-90 border-green-800 shadow-[0_0_20px_rgba(0,255,0,0.1)]' : 'bg-black border-gray-800 shadow-none'}`}>
      
      <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
        {isRetro ? (
          <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#0f0]"></div>
        ) : (
          <div className="h-2 w-2 sm:h-3 sm:w-3 bg-gray-500 animate-pulse"></div>
        )}
        
        {/* DESKTOP TITLE */}
        <h1 className={`font-digital text-xl sm:text-2xl tracking-widest uppercase transition-colors duration-300 hidden sm:block
          ${isRetro ? 'text-green-500 [text-shadow:0_0_10px_rgba(0,255,0,0.7)]' : 'text-gray-400'}`}>
          {desktopTitlePart1}<span className={`mx-1 ${isRetro ? 'text-green-800' : 'text-gray-600'}`}>_</span>{desktopTitlePart2}
        </h1>
        
        {/* MOBILE TITLE */}
        <h1 className={`sm:hidden font-digital text-lg ${isRetro ? 'text-green-500' : 'text-gray-400'}`}>
          {mobileTitle}
        </h1>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-6 ml-auto">
        
        {/* AUDIO TOGGLE */}
        <button 
          onClick={onToggleMute}
          className={`text-[10px] sm:text-xs uppercase tracking-widest border px-1 sm:px-2 py-1 transition-all font-terminal whitespace-nowrap
            ${isRetro 
              ? 'border-green-800 text-green-700 hover:text-green-400 hover:border-green-400' 
              : 'border-gray-600 text-gray-400 hover:bg-gray-900'
            }`}
        >
          <span className="hidden sm:inline">[AUDIO: {isMuted ? 'OFF' : 'ON'}]</span>
          <span className="sm:hidden">SND:{isMuted ? 'OFF' : 'ON'}</span>
        </button>

        {/* MODE TOGGLE */}
        <button 
          onClick={onToggleMode}
          className={`text-[10px] sm:text-xs uppercase tracking-widest border px-1 sm:px-2 py-1 transition-all font-terminal whitespace-nowrap
            ${isRetro 
              ? 'border-green-800 text-green-700 hover:text-green-400 hover:border-green-400' 
              : 'border-gray-600 text-gray-400 hover:bg-gray-900'
            }`}
        >
           <span className="hidden sm:inline">[SYSTEM: {modeDisplayName}]</span>
           <span className="sm:hidden">SYS:{modeMobileName}</span>
        </button>

        {/* THEME TOGGLE */}
        <button 
          onClick={onToggleTheme}
          className={`text-[10px] sm:text-xs uppercase tracking-widest border px-1 sm:px-2 py-1 transition-all font-terminal whitespace-nowrap
            ${isRetro 
              ? 'border-green-800 text-green-700 hover:text-green-400 hover:border-green-400' 
              : 'border-gray-600 text-gray-400 hover:bg-gray-900'
            }`}
        >
           <span className="hidden sm:inline">[THEME: {theme.toUpperCase()}]</span>
           <span className="sm:hidden">{theme.toUpperCase()}</span>
        </button>

        <div className="flex flex-col items-end ml-2 sm:ml-0">
          <div className={`tracking-widest leading-none transition-colors duration-300 font-digital text-base sm:text-3xl
            ${isRetro ? 'text-red-500 [text-shadow:0_0_10px_rgba(255,0,0,0.7)]' : 'text-gray-300'}`}>
            {formattedTime}
          </div>
          <div className={`transition-colors duration-300 font-terminal text-[10px] sm:text-lg
            ${isRetro ? 'text-green-700' : 'text-gray-500 mt-1'}`}>
            {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
