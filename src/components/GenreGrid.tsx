
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const genres = [
  // Popular Genres
  'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller',
  // Specific Genres
  'Adventure', 'Animation', 'Biography', 'Crime', 'Documentary', 'Family',
  // Niche Genres
  'Fantasy', 'Film-Noir', 'History', 'Musical', 'Mystery', 'Sci-Fi',
  // Special Categories
  'Sport', 'War', 'Western', 'Cyberpunk', 'Superhero', 'Psychological'
];

export const GenreGrid = ({ onGenreSelect }: { onGenreSelect: (genre: string) => void }) => {
  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {genres.map((genre, index) => (
        <motion.div
          key={genre}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button 
            onClick={() => onGenreSelect(genre)}
            className="w-full h-full min-h-[80px] text-lg font-medium bg-[#1E1E1E] hover:bg-[#8B5CF6] text-[#F5F5F5]"
            variant="ghost"
          >
            {genre}
          </Button>
        </motion.div>
      ))}
    </div>
  );
};
