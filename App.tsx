import React, { useState, useEffect, useRef } from 'react';
import { Send, PawPrint, X, RefreshCcw, ChevronDown, MessageCircle } from 'lucide-react';
import ChatMessage from './components/ChatMessage';
import QuickActions from './components/QuickActions';
import { sendMessageToGemini, resetChat } from './services/geminiService';
import { Message, ChatState } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Hi there! 🐾 I'm the AI assistant for **My Pawcation**. I can help you with boarding rates, booking info, and answering questions about our cage-free home-style care. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [chatState, setChatState] = useState<ChatState>(ChatState.IDLE);
  const [isOpen, setIsOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when opened for better accessibility
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim() || chatState === ChatState.LOADING || chatState === ChatState.STREAMING) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setChatState(ChatState.LOADING); // Start typing indicator

    // Create a placeholder for the bot response
    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: Message = {
      id: botMessageId,
      role: 'model',
      content: '', // Start empty
      timestamp: new Date()
    };
    setMessages(prev => [...prev, initialBotMessage]);

    try {
      await sendMessageToGemini(text, (streamedText) => {
        // Switch to streaming state once first chunk arrives
        setChatState(ChatState.STREAMING);
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, content: streamedText } : msg
        ));
      });
      setChatState(ChatState.IDLE);
    } catch (error: any) {
      console.error(error);
      
      let errorMessage = "⚠️ Sorry, I'm having trouble connecting right now. Please try again later or contact us directly on WhatsApp.";
      
      // Improve error feedback
      if (error.message?.includes("API Key")) {
        errorMessage = "⚠️ Configuration Error: API Key is missing or invalid.";
      } else if (error.message?.includes("Failed to fetch") || error.message?.includes("Network")) {
        errorMessage = "⚠️ Network Error: Please check your internet connection.";
      } else if (error.status === 503) {
        errorMessage = "⚠️ Service temporarily unavailable. Please try again in a moment.";
      }

      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { ...msg, content: errorMessage } : msg
      ));
      setChatState(ChatState.ERROR);
    }
  };

  const handleQuickAction = (query: string) => {
    handleSendMessage(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([messages[0]]);
    resetChat();
    // Focus back to input after reset for keyboard users
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-4 pointer-events-auto font-sans">
      
      {/* Chat Window Container */}
      <div 
        id="chat-window"
        role="dialog"
        aria-label="My Pawcation AI Chat Assistant"
        aria-modal="false"
        className={`
          transition-all duration-300 ease-in-out transform origin-bottom-right
          bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200
          flex flex-col
          ${isOpen ? 'scale-100 opacity-100 translate-y-0 visible' : 'scale-95 opacity-0 translate-y-10 invisible pointer-events-none'}
        `}
        style={{
          width: 'min(380px, calc(100vw - 32px))',
          height: 'min(600px, calc(100vh - 100px))',
        }}
      >
        {/* Header - Brown Theme */}
        <div className="bg-[#8B5E3C] p-4 flex items-center justify-between text-white shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <PawPrint size={18} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">My Pawcation</h2>
              <div className="flex items-center gap-1.5 opacity-90" role="status" aria-label="Status: Online">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                <span className="text-[10px] font-medium">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleReset}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              title="Reset Chat"
              aria-label="Reset Chat"
            >
              <RefreshCcw size={16} />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              title="Close Chat"
              aria-label="Close Chat"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area - Stone/Neutral Background */}
        <div 
          className="flex-1 overflow-y-auto bg-stone-50 p-4 scrollbar-hide"
          role="log"
          aria-live="polite"
          aria-atomic="false"
        >
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {/* Typing Indicator */}
            {chatState === ChatState.LOADING && (
              <div className="flex justify-start" role="status" aria-label="Agent is typing">
                 <div className="flex items-center gap-1.5 bg-white px-3 py-2.5 rounded-2xl rounded-tl-none border border-stone-100 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-[#8B5E3C] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#8B5E3C] rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-[#8B5E3C] rounded-full animate-bounce delay-200"></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-stone-100 shrink-0">
           {/* Quick Actions Scroll Area */}
           <div className="pt-3 pb-1">
              <QuickActions onActionClick={handleQuickAction} disabled={chatState !== ChatState.IDLE && chatState !== ChatState.ERROR} />
           </div>

           <div className="p-3 pt-1">
             <div className="relative flex items-center">
               <input
                 ref={inputRef}
                 type="text"
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 onKeyDown={handleKeyPress}
                 placeholder="Type your message..."
                 disabled={chatState === ChatState.LOADING || chatState === ChatState.STREAMING}
                 aria-label="Type your message"
                 className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-sm rounded-full focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] block pl-4 pr-10 py-2.5 outline-none transition-all disabled:opacity-60 placeholder:text-stone-400"
               />
               <button
                 onClick={() => handleSendMessage()}
                 disabled={!inputText.trim() || chatState === ChatState.LOADING || chatState === ChatState.STREAMING}
                 aria-label="Send message"
                 className="absolute right-1.5 p-1.5 bg-[#8B5E3C] text-white rounded-full hover:bg-[#6F4E37] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5E3C]"
               >
                 <Send size={16} />
               </button>
             </div>
             <div className="text-center mt-2">
                  <a href="https://wa.me/60173840723" target="_blank" rel="noreferrer" className="text-[10px] text-stone-400 hover:text-[#8B5E3C] transition-colors focus:outline-none focus:underline">
                    Need human help? WhatsApp Us
                  </a>
             </div>
           </div>
        </div>
      </div>

      {/* Launcher Button - Brown Theme */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat assistant"}
        aria-expanded={isOpen}
        aria-controls="chat-window"
        className={`
          flex items-center justify-center
          w-14 h-14 rounded-full shadow-lg 
          bg-[#8B5E3C] hover:bg-[#6F4E37] active:bg-[#5D4037]
          text-white transition-all duration-300 transform hover:scale-105 active:scale-95
          focus:outline-none focus:ring-4 focus:ring-[#8B5E3C]/30
          ${isOpen ? 'rotate-90' : 'rotate-0'}
        `}
      >
        {isOpen ? <ChevronDown size={28} aria-hidden="true" /> : <MessageCircle size={28} className="fill-current" aria-hidden="true" />}
        {!isOpen && (
           <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>

    </div>
  );
}

export default App;