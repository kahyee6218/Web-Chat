import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'model';

  return (
    <div className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[90%] ${isBot ? 'flex-row' : 'flex-row-reverse'} gap-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1 ${isBot ? 'bg-[#8B5E3C] text-white' : 'bg-stone-200 text-stone-600'}`}>
          {isBot ? <Bot size={14} /> : <User size={14} />}
        </div>

        {/* Bubble */}
        <div
          className={`px-3 py-2 rounded-2xl shadow-sm text-sm overflow-hidden leading-relaxed ${
            isBot
              ? 'bg-white text-stone-800 rounded-tl-none border border-stone-100'
              : 'bg-[#8B5E3C] text-white rounded-tr-none'
          }`}
        >
          <div className={`markdown-body ${isBot ? '' : 'text-white'}`}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-1 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-1 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="my-0.5" {...props} />,
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                a: ({node, ...props}) => <a className="underline hover:text-stone-200" target="_blank" rel="noopener noreferrer" {...props} />,
                table: ({node, ...props}) => <div className="overflow-x-auto my-2 max-w-full"><table className="min-w-full divide-y divide-stone-300 border border-stone-200" {...props} /></div>,
                th: ({node, ...props}) => <th className="px-2 py-1 bg-stone-50 text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b" {...props} />,
                td: ({node, ...props}) => <td className="px-2 py-1 text-xs border-b border-stone-100" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          <span className={`text-[9px] block mt-1 opacity-70 ${isBot ? 'text-stone-400' : 'text-stone-100 text-right'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;