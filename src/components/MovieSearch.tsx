
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface MovieSearchProps {
  selectedGenre: string;
}

// Sample movie database - in a real app, this would come from an API
const moviesByGenre: Record<string, { title: string; year: number }[]> = {
  'Action': [
    { title: 'Die Hard', year: 1988 },
    { title: 'Mad Max: Fury Road', year: 2015 },
    { title: 'John Wick', year: 2014 }
  ],
  'Comedy': [
    { title: 'Superbad', year: 2007 },
    { title: 'The Hangover', year: 2009 },
    { title: 'Bridesmaids', year: 2011 }
  ],
  // Add more genres with sample movies
  'Drama': [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'Forrest Gump', year: 1994 }
  ],
  'Horror': [
    { title: 'The Shining', year: 1980 },
    { title: 'Get Out', year: 2017 },
    { title: 'A Quiet Place', year: 2018 }
  ]
};

export const MovieSearch = ({ selectedGenre }: MovieSearchProps) => {
  const [movieTitle, setMovieTitle] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const genreMovies = moviesByGenre[selectedGenre] || [];

  const handleSearch = () => {
    console.log('Searching for similar movies to:', movieTitle, 'in genre:', selectedGenre);
    setShowSuggestions(true);
  };

  const handleMovieSelect = (movie: { title: string; year: number }) => {
    setMovieTitle(movie.title);
    setShowSuggestions(false);
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6">
        You picked {selectedGenre}
      </h2>
      
      <div className="w-full max-w-md space-y-4">
        <Input
          type="text"
          placeholder="Type a movie you've seen..."
          value={movieTitle}
          onChange={(e) => setMovieTitle(e.target.value)}
          className="bg-[#1E1E1E] text-[#F5F5F5] border-[#333333]"
        />
        
        <Button 
          onClick={handleSearch}
          className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
        >
          Search
        </Button>

        {showSuggestions && (
          <div className="mt-6 space-y-2">
            <h3 className="text-[#F5F5F5] text-lg font-semibold mb-4">
              Popular {selectedGenre} Movies:
            </h3>
            {genreMovies.map((movie, index) => (
              <motion.div
                key={movie.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => handleMovieSelect(movie)}
                  className="w-full text-left justify-start bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#F5F5F5]"
                >
                  {movie.title} ({movie.year})
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
