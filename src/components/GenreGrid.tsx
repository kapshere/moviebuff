import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MovieSearchBar } from './MovieSearchBar';
const genres = [{
  id: 28,
  name: 'Action 🎬'
}, {
  id: 35,
  name: 'Comedy 😄'
}, {
  id: 18,
  name: 'Drama 🎭'
}, {
  id: 27,
  name: 'Horror 👻'
}, {
  id: 10749,
  name: 'Romance 💝'
}, {
  id: 53,
  name: 'Thriller 😱'
}, {
  id: 12,
  name: 'Adventure 🌎'
}, {
  id: 16,
  name: 'Animation 🎨'
}, {
  id: 80,
  name: 'Crime 🚔'
}, {
  id: 99,
  name: 'Documentary 📽'
}, {
  id: 10751,
  name: 'Family 👨‍👩‍👧‍👦'
}, {
  id: 14,
  name: 'Fantasy ✨'
}, {
  id: 36,
  name: 'History 📚'
}, {
  id: 10402,
  name: 'Music 🎵'
}, {
  id: 9648,
  name: 'Mystery 🔍'
}, {
  id: 878,
  name: 'Science Fiction 🚀'
}];
interface GenreGridProps {
  onGenreSelect: (genre: string) => void;
  onDirectSearch: (query: string) => void;
}
export const GenreGrid = ({
  onGenreSelect,
  onDirectSearch
}: GenreGridProps) => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre);
    onGenreSelect(genre);
  };
  return <div className="p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="font-bold text-[#F5F5F5] mb-2 text-4xl text-center">🎬 What to watch?</h2>
        <p className="text-[#AAAAAA] text-lg">
          Search directly or choose a genre to explore
        </p>
        <MovieSearchBar onSearch={onDirectSearch} placeholder="Search any movie to find similar ones... 🔍" />
        <div className="w-full max-w-xl mx-auto pt-4">
          <div className="h-px bg-gradient-to-r from-transparent via-[#333333] to-transparent" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {genres.map((genre, index) => <motion.div key={genre.id} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }}>
            <Button onClick={() => handleGenreClick(genre.name.split(' ')[0])} className={`w-full h-full min-h-[80px] text-lg font-medium transition-all duration-300
                ${selectedGenre === genre.name.split(' ')[0] ? 'bg-[#8B5CF6] text-white shadow-lg' : 'bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#F5F5F5]'}`} variant="ghost">
              <span className="flex flex-col items-center gap-2">
                <span className="text-2xl">{genre.name.split(' ')[1]}</span>
                <span className="text-sm font-normal">{genre.name.split(' ')[0]}</span>
              </span>
            </Button>
          </motion.div>)}
      </div>
    </div>;
};