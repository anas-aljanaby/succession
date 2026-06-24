import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../lib/i18n';
import { Button } from '../ui/Button';
import { XMarkIcon } from '@/components/icons/XMarkIcon';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AiChatbotPanel: React.FC<Props> = ({ open, onClose }) => {
  const { t, language } = useLanguage();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: t('topbar.aiWelcome'),
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((current) =>
      current.map((message) =>
        message.id === 'welcome' ? { ...message, text: t('topbar.aiWelcome') } : message
      )
    );
  }, [language, t]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  if (!open) return null;

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: 'user', text },
      {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: t('topbar.aiStubReply'),
      },
    ]);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t('form.cancel')}
        onClick={onClose}
      />
      <aside className="relative h-full w-full max-w-md bg-gray-900 border-s border-gray-800 shadow-2xl flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="font-semibold text-white">{t('topbar.aiAdvisor')}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label={t('form.cancel')}
          >
            <XMarkIcon />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                message.role === 'user'
                  ? 'ms-auto bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {message.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="p-4 border-t border-gray-800 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('topbar.aiPlaceholder')}
            className="flex-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <Button type="submit">{t('topbar.aiSend')}</Button>
        </form>
      </aside>
    </div>
  );
};
