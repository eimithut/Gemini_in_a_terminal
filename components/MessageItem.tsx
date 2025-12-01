
import React from 'react';
import { Message, Sender, Theme } from '../types';

interface MessageItemProps {
  message: Message;
  theme: Theme;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, theme }) => {
  const isUser = message.sender === Sender.USER;
  const isSystem = message.sender === Sender.SYSTEM;
  const isRetro = theme === 'retro';

  // Format timestamp like a digital log: [HH:MM:SS]
  const timeString = message.timestamp.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Retro Colors
  const retroSystemColor = 'text-yellow-500';
  const retroUserColor = 'text-green-400';
  const retroAIColor = 'text-green-300';
  const retroMetaColor = 'text-green-600';
  const retroCodeBg = 'bg-green-900 bg-opacity-30 border border-green-700';

  // Clean Colors (Soft Grey)
  const cleanSystemColor = 'text-gray-500';
  const cleanUserColor = 'text-gray-200 font-bold';
  const cleanAIColor = 'text-gray-300';
  const cleanMetaColor = 'text-gray-600';
  const cleanCodeBg = 'bg-gray-800 border border-gray-700';

  let textColorClass = '';
  if (isRetro) {
    textColorClass = isSystem ? retroSystemColor : isUser ? retroUserColor : retroAIColor;
  } else {
    textColorClass = isSystem ? cleanSystemColor : isUser ? cleanUserColor : cleanAIColor;
  }

  // Use font-terminal (VT323) for both themes now
  const fontClass = 'font-terminal text-xl';
  const metaColor = isRetro ? retroMetaColor : cleanMetaColor;
  const textShadow = isRetro ? { textShadow: '0 0 5px rgba(50, 255, 50, 0.5)' } : {};
  const codeBgClass = isRetro ? retroCodeBg : cleanCodeBg;

  // --- SIMPLE MARKDOWN PARSER ---
  const renderContent = (text: string) => {
    // 1. Split by Code Blocks (```language ... ```)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Push preceding text
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      // Push code block
      parts.push({ type: 'code', language: match[1] || 'text', content: match[2] });
      lastIndex = match.index + match[0].length;
    }
    // Push remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <div key={index} className={`my-2 p-3 rounded text-sm font-mono overflow-x-auto ${codeBgClass}`}>
             <div className="opacity-50 text-xs uppercase mb-1 border-b border-gray-600 pb-1 w-full">{part.language}</div>
             <pre className="m-0 whitespace-pre">{part.content}</pre>
          </div>
        );
      } else {
        // Render Inline Text with Bold/Italic formatting
        return (
          <span key={index} dangerouslySetInnerHTML={{ 
            __html: formatInlineMarkdown(part.content) 
          }} />
        );
      }
    });
  };

  const formatInlineMarkdown = (text: string) => {
    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Bold (**text**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Inline Code (`text`)
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-700 bg-opacity-50 px-1 rounded mx-1 text-sm">$1</code>');
    
    return formatted;
  };

  return (
    <div className={`mb-6 ${textColorClass}`}>
      <div className={`flex flex-col sm:flex-row ${fontClass}`}>
        <span className={`flex-shrink-0 mr-4 opacity-70 select-none ${metaColor} text-lg pt-1`}>
          [{timeString}] {isUser ? '>> OP' : isSystem ? '>> SYS' : '>> CPU'}
        </span>
        <div 
          className="whitespace-pre-wrap break-words leading-relaxed w-full"
          style={textShadow}
        >
           {renderContent(message.text)}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
