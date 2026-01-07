
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

const GeminiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Bem-vindo à Lumatrix. Sou sua consultora de investimentos imobiliários. Como posso auxiliá-lo hoje?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Fix: Filter and cast roles to ensure compatibility with geminiService which expects 'user' | 'model'
    const history = messages
      .filter(m => m.role === 'user' || m.role === 'model')
      .map(m => ({ role: m.role as 'user' | 'model', text: m.text }));
    const responseText = await geminiService.getChatResponse(input, history);

    const modelMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen ? (
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-[350px] sm:w-[400px] h-[550px] flex flex-col border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-[#1a365d] p-6 flex justify-between items-center text-white shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#c19a5b] rounded-2xl flex items-center justify-center font-black text-[#1a365d]">L</div>
              <div className="flex flex-col">
                <span className="font-black text-sm uppercase tracking-widest">Lumatrix AI</span>
                <span className="text-[8px] font-bold text-[#c19a5b] uppercase tracking-[0.2em]">Consultoria Ativa</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 rounded-xl p-2 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfdfe]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-[#1a365d] text-white rounded-tr-none shadow-md' 
                  : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm flex space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#c19a5b] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#c19a5b] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#c19a5b] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-50 flex items-center space-x-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Sua dúvida imobiliária..."
              className="flex-1 bg-slate-50 border border-slate-100 rounded-full px-6 py-3 text-sm focus:ring-2 focus:ring-[#c19a5b] outline-none transition-all"
            />
            <button 
              onClick={handleSend}
              className="bg-[#c19a5b] p-3 rounded-full text-white hover:brightness-110 shadow-lg transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 12h14"/></svg>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#1a365d] text-white p-5 rounded-[2rem] shadow-2xl hover:scale-110 transition-all flex items-center space-x-3 border-4 border-white group"
        >
          <div className="w-8 h-8 bg-[#c19a5b] rounded-xl flex items-center justify-center text-[#1a365d] font-black group-hover:rotate-6 transition-transform">L</div>
          <span className="font-black text-[10px] uppercase tracking-[0.3em] hidden sm:inline">Consultoria Lumatrix</span>
        </button>
      )}
    </div>
  );
};

export default GeminiChatbot;
