import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';
import { dbService } from '../services/dbService';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat with context
    const data = dbService.exportForAI();
    geminiService.startChat(data).then(() => {
      setMessages([{
        id: 'init',
        role: 'model',
        text: "I'm monitoring your habits. Talk to me. Why are you vaping?"
      }]);
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await geminiService.sendMessage(userMsg.text);
    setMessages(prev => [...prev, response]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center gap-2">
        <Bot className="text-indigo-500" size={20} />
        <span className="font-mono font-bold text-zinc-200">COACH PUNCH</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-zinc-800 text-white' 
                : 'bg-indigo-900/20 text-indigo-200 border border-indigo-500/20'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-zinc-900 p-3 rounded-lg flex items-center gap-2 text-xs text-zinc-500">
                <Loader2 className="animate-spin" size={14} /> Thinking...
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-950 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for advice..."
            className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500 text-sm"
          />
          <button 
            onClick={handleSend}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-md transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;