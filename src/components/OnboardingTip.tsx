
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export const OnboardingTip = ({ onDismiss }: { onDismiss: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-[#121212] flex flex-col items-center justify-center px-4"
    >
      <div className="max-w-md space-y-6 text-center">
        <h2 className="text-2xl font-semibold text-[#F5F5F5] mb-8">How it works</h2>
        <ul className="space-y-4 text-[#F5F5F5]/80">
          <li className="flex items-center space-x-2">
            <span className="text-[#00E5FF]">1.</span>
            <span>Choose a genre</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-[#00E5FF]">2.</span>
            <span>Enter a movie you've seen</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-[#00E5FF]">3.</span>
            <span>Get similar recommendations</span>
          </li>
        </ul>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            onClick={onDismiss}
            variant="ghost" 
            className="text-[#00E5FF] hover:text-[#00E5FF]/80 mt-8"
          >
            Got it
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
