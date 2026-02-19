import React from 'react';
import { motion } from 'framer-motion';
import { SocialClass, ClassTier } from '@/lib/simulation/types';

interface ProgressCardProps {
  currentClass: SocialClass;
  previousClass?: SocialClass;
  metric: keyof import('@/lib/simulation/types').ClassMetrics;
  label: string;
  unit?: string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ 
  currentClass, 
  previousClass, 
  metric, 
  label, 
  unit = '%' 
}) => {
  const currentVal = Math.round(currentClass.metrics[metric]);
  const prevVal = previousClass ? Math.round(previousClass.metrics[metric]) : null;
  
  const diff = prevVal !== null ? currentVal - prevVal : 0;
  const isPositive = diff > 0;
  const isNegative = diff < 0;
  
  // Determine if higher is better for color coding
  const higherIsBetter = metric !== 'poverty';
  const isImprovement = (higherIsBetter && isPositive) || (!higherIsBetter && isNegative);
  
  const colorClass = isImprovement ? 'text-green-400' : 'text-red-400';
  const arrow = isPositive ? '↑' : isNegative ? '↓' : '';

  return (
    <div className="bg-white/5 border border-white/10 p-3 rounded-lg w-full">
      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold font-orbitron text-white">
          {currentVal}{unit}
        </div>
        
        {prevVal !== null && diff !== 0 && (
          <div className={`text-sm font-rajdhani font-bold flex items-center ${colorClass}`}>
            <span>{arrow} {Math.abs(diff)}</span>
            <span className="ml-1 text-xs opacity-70">since last check</span>
          </div>
        )}
      </div>
      
      {/* Mini progress bar context */}
      <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${isImprovement ? 'bg-green-500/50' : 'bg-blue-500/50'}`}
          initial={{ width: `${prevVal || 0}%` }}
          animate={{ width: `${currentVal}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>
  );
};
