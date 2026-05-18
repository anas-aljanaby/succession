
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, Language, Translations } from '../types';
import { Button } from './common/Button';
import { Card } from './common/Card';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { Spinner } from './common/Spinner';

interface AiChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  t: Translations;
  language: Language;
}

const AiChatbot: React.FC<AiChatbotProps> = ({ isOpen, onToggle, messages, onSendMessage, isLoading, t, language }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <>
      <button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 rtl:right-auto rtl:left-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-500 transition-transform transform ${isOpen ? 'scale-0' : 'scale-100'}`}
        aria-label="Toggle AI Advisor Chat"
      >
        <ChatBubbleLeftRightIcon />
      </button>

      <div
        className={`fixed bottom-6 right-6 rtl:right-auto rtl:left-6 w-[calc(100%-3rem)] max-w-md h-[70vh] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <Card className="h-full flex flex-col p-0 border-2 border-primary-500/30">
          <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 rounded-t-lg">
            <h3 className="font-semibold text-white">{t.aiChatbotTitle}</h3>
            <button onClick={onToggle} className="text-gray-400 hover:text-white">
              <XMarkIcon />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary-500 flex-shrink-0" />}
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex-shrink-0" />
                  <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-gray-700 text-gray-200">
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      </div>
                  </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.chatbotPlaceholder}
                className="w-full bg-gray-700 border border-gray-600 rounded-full py-2 ps-4 pe-12 text-white placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`absolute inset-y-0 ${language === 'ar' ? 'left-2' : 'right-2'} flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-500 disabled:bg-gray-500`}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Spinner /> : <PaperAirplaneIcon />}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};

export default AiChatbot;
