import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, Compass, HelpCircle } from 'lucide-react';
import { Room } from '../../types';

interface AskGeminiModalProps {
  rooms: Room[];
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onSelectRoom?: (room: Room) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
}

export const AskGeminiModal: React.FC<AskGeminiModalProps> = ({
  rooms,
  isOpen,
  onClose,
  onOpen,
  onSelectRoom,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'gemini',
      text: 'Hello! I am your AI concierge for Diversion Vigan Transient. How can I help you today? You can ask about our rooms, group sizes, custom rates, or directions to Calle Crisologo!',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    'Which room is best for a family of 6?',
    'What are your check-in and check-out times?',
    'Do you have weekend rates or holiday surcharges?',
    'How far is Diversion Road from Calle Crisologo?',
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    setTimeout(() => {
      let reply = '';
      const lower = q.toLowerCase();

      if (lower.includes('family') || lower.includes('6') || lower.includes('group') || lower.includes('8')) {
        reply = 'For larger families or groups, we recommend **Room 1 - Standard Family Suite** (up to 6 guests at ₱2,800/night) or **Room 3 - Heritage Balcony Suite** (up to 8 guests at ₱3,200/night with dual bathrooms). Both feature spacious bedding and kitchenette amenities.';
      } else if (lower.includes('check-in') || lower.includes('check in') || lower.includes('time') || lower.includes('hours')) {
        reply = 'Standard check-in starts at **2:00 PM** and check-out is by **12:00 PM (Noon)**. Front desk is staffed 24/7 on Diversion Road, and late check-in is readily accommodated upon request!';
      } else if (lower.includes('calle crisologo') || lower.includes('location') || lower.includes('attraction') || lower.includes('far')) {
        reply = 'Diversion Vigan Transient is situated along Diversion Road in Vigan City, just **5 to 8 minutes** by tricycle or car from Calle Crisologo, Plaza Salcedo, and the Bantay Bell Tower. It provides quiet relaxation away from cobblestone traffic!';
      } else if (lower.includes('rate') || lower.includes('custom') || lower.includes('pax') || lower.includes('weekend')) {
        reply = 'Our rates start at **₱1,500/night** for Studio Rooms. Friday and Saturday bookings may feature weekend rates, and extra guests beyond the base pax incur a modest surcharge of ₱350–₱400/night. We also offer 10%–18% discounts on stays of 3 nights or more!';
      } else {
        reply = `Diversion Vigan Transient offers 8 well-appointed studio rooms, family suites, and modern lofts with fiber Wi-Fi, air conditioning, and parking along Diversion Road. Feel free to browse our listings or check our live room calendar!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'gemini',
          text: reply,
        },
      ]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Pill Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-40 bg-stone-950 dark:bg-stone-900 hover:bg-stone-900 text-amber-300 font-semibold text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-amber-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Ask Gemini</span>
        </button>
      )}

      {/* Assistant Modal Window */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Ask Gemini Concierge</h3>
                  <p className="text-[11px] text-slate-400">Diversion Vigan Transient Virtual Assistant</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[260px] max-h-[400px]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'gemini' && (
                    <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 text-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-amber-600 text-white rounded-br-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-300 border border-amber-600/30 flex items-center justify-center shrink-0 text-[10px] font-bold">
                      DV
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 items-center text-slate-400 text-xs py-2">
                  <Bot className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>Gemini is generating recommendations...</span>
                </div>
              )}
            </div>

            {/* Suggested Prompts */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
              {suggestedQuestions.map((sq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(sq)}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 hover:border-amber-400 dark:hover:border-amber-500 whitespace-nowrap transition-colors shrink-0 cursor-pointer"
                >
                  {sq}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about rooms, rates, policies, or Vigan..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/25 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
                aria-label="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
