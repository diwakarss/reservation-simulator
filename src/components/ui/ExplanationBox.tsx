import React from 'react';
import { motion } from 'framer-motion';

interface ExplanationBoxProps {
  title?: string;
  titleClassName?: string;
  children: React.ReactNode;
  className?: string;
}

export const ExplanationBox: React.FC<ExplanationBoxProps> = ({
  title = "Policy Insight",
  titleClassName = "text-base",
  children,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 border border-white/10 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 min-w-[24px]">
          <span className="flex items-center justify-center w-6 h-6 rounded-full border border-blue-400/50 text-blue-400 text-sm font-bold">
            i
          </span>
        </div>
        <div>
          <h4 className={`font-semibold text-blue-300 mb-1 font-orbitron tracking-wide ${titleClassName}`}>
            {title}
          </h4>
          <div className="text-base text-gray-200 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
