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
      <div className={`max-w-[80%] ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-foreground">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
