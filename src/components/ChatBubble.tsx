import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { Message } from '@/stores/chatStore';

export default function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? 'chat-bubble-user-dark' : 'chat-bubble-ai-dark'}`}>
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none text-slate-100 prose-strong:text-white prose-headings:text-white prose-a:text-teal-300">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
