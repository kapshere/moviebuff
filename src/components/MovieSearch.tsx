
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MovieSearchProps {
  selectedGenre: string;
}

export const MovieSearch = ({ selectedGenre }: MovieSearchProps) => {
  const [movieTitle, setMovieTitle] = useState('');

  const handleSearch = () => {
    console.log('Searching for similar movies to:', movieTitle, 'in genre:', selectedGenre);
    // This would be where we'd fetch recommendations in a future implementation
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
      </div>
    </div>
  );
};
