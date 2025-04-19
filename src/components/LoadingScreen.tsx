
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogo(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div 
      className="fixed inset-0 bg-[#121212] flex items-center justify-center"
      animate={{
        opacity: showLogo ? 0 : 1
      }}
      onAnimationComplete={() => {
        if (showLogo) onComplete();
      }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-4xl font-bold text-[#F5F5F5]"
      >
        What to Watch?
      </motion.h1>
    </motion.div>
  );
};
