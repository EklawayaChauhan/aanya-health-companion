import { motion, type TargetAndTransition } from 'framer-motion';
import { useChatStore, type AvatarState } from '@/stores/chatStore';
import aanyaImg from '@/assets/aanya-avatar.png';

const stateAnimations: Record<AvatarState, TargetAndTransition> = {
  idle: { scale: [1, 1.02, 1], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
  listening: { rotate: [0, -3, 3, 0], transition: { duration: 2, repeat: Infinity } },
  thinking: { opacity: [1, 0.7, 1], transition: { duration: 1.5, repeat: Infinity } },
  speaking: { scale: [1, 1.03, 1, 1.02, 1], transition: { duration: 0.8, repeat: Infinity } },
};

export default function AanyaAvatar({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const avatarState = useChatStore((s) => s.avatarState);
  const dim = size === 'lg' ? 'w-32 h-32' : 'w-12 h-12';

  return (
    <div className="relative flex items-center justify-center">
      {avatarState === 'listening' && (
        <>
          <span className="pulse-ring w-36 h-36" />
          <span className="pulse-ring w-40 h-40" style={{ animationDelay: '0.5s' }} />
        </>
      )}
      <motion.div
        animate={stateAnimations[avatarState]}
        className={`${dim} rounded-full overflow-hidden glass-card-strong p-1`}
      >
        <img src={aanyaImg} alt="Aanya - AI Health Assistant" className="w-full h-full object-cover rounded-full" />
      </motion.div>
    </div>
  );
}
