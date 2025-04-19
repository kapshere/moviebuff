
import React from 'react';
import { motion } from 'framer-motion';

const genres = [
  'Mystery', 'Comedy', 'Cyberpunk', 'Drama',
  'Thriller', 'Romance', 'Sci-Fi', 'Horror',
  'Animation', 'Documentary'
];

export const GenreGrid = ({ onGenreSelect }: { onGenreSelect: (genre: string) => void }) => {
  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {genres.map((genre, index) => (
        <motion.button
          key={genre}
          onClick={() => onGenreSelect(genre)}
          className="p-6 text-lg font-medium text-[#F5F5F5] bg-[#1E1E1E] rounded-lg hover:bg-[#2A2A2A] transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {genre}
        </motion.button>
      ))}
    </div>
  );
};
