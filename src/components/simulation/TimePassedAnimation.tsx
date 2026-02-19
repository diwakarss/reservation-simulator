import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimePassedAnimationProps {
  years: number;
  onComplete?: () => void;
  isVisible: boolean;
}

export const TimePassedAnimation: React.FC<TimePassedAnimationProps> = ({ 
  years, 
  onComplete,
  isVisible 
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => {
            // Wait a moment then signal completion if provided
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 1500);
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center px-6"
          >
            <h2 className="text-4xl md:text-6xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 mb-6 tracking-wider">
              {years} YEARS LATER
            </h2>
            
            <div className="flex justify-center gap-4 mt-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 rounded-full bg-blue-500"
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-gray-400 font-rajdhani text-xl"
            >
              Calculating societal impact...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
