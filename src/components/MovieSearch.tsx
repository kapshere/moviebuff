
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCheck } from 'lucide-react';

interface MovieSearchProps {
  selectedGenre: string;
}

// Sample movie database with posters - in a real app, this would come from an API
const moviesByGenre: Record<string, { title: string; year: number; poster: string; id: string }[]> = {
  'Action': [
    { title: 'Die Hard', year: 1988, poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', id: 'act1' },
    { title: 'Mad Max: Fury Road', year: 2015, poster: 'https://images.unsplash.com/photo-1500673922987-e212871fec22', id: 'act2' },
    { title: 'John Wick', year: 2014, poster: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', id: 'act3' }
  ],
  'Comedy': [
    { title: 'Superbad', year: 2007, poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', id: 'com1' },
    { title: 'The Hangover', year: 2009, poster: 'https://images.unsplash.com/photo-1500673922987-e212871fec22', id: 'com2' },
    { title: 'Bridesmaids', year: 2011, poster: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', id: 'com3' }
  ],
  'Drama': [
    { title: 'The Shawshank Redemption', year: 1994, poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', id: 'dra1' },
    { title: 'The Godfather', year: 1972, poster: 'https://images.unsplash.com/photo-1500673922987-e212871fec22', id: 'dra2' },
    { title: 'Forrest Gump', year: 1994, poster: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', id: 'dra3' }
  ],
  'Horror': [
    { title: 'The Shining', year: 1980, poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', id: 'hor1' },
    { title: 'Get Out', year: 2017, poster: 'https://images.unsplash.com/photo-1500673922987-e212871fec22', id: 'hor2' },
    { title: 'A Quiet Place', year: 2018, poster: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', id: 'hor3' }
  ],
  'Thriller': [
    { title: 'The Silence of the Lambs', year: 1991, poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', id: 'thr1' },
    { title: 'Seven', year: 1995, poster: 'https://images.unsplash.com/photo-1500673922987-e212871fec22', id: 'thr2' },
    { title: 'Gone Girl', year: 2014, poster: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', id: 'thr3' }
  ],
  'Romance': [
    { title: 'The Notebook', year: 2004, poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', id: 'rom1' },
    { title: 'Pride & Prejudice', year: 2005, poster: 'https://images.unsplash.com/photo-1500673922987-e212871fec22', id: 'rom2' },
    { title: 'La La Land', year: 2016, poster: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', id: 'rom3' }
  ]
};

export const MovieSearch = ({ selectedGenre }: MovieSearchProps) => {
  const [movieTitle, setMovieTitle] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<{ title: string; year: number; poster: string; id: string } | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const genreMovies = moviesByGenre[selectedGenre] || [];

  const handleSearch = () => {
    console.log('Searching for similar movies to:', movieTitle, 'in genre:', selectedGenre);
    setShowSuggestions(true);
  };

  const handleMovieSelect = (movie: { title: string; year: number; poster: string; id: string }) => {
    setMovieTitle(movie.title);
    setSelectedMovie(movie);
    setShowSuggestions(false);
  };

  const handleDone = () => {
    if (!selectedMovie) {
      toast.error('Please select a movie first');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call to get recommendations
    setTimeout(() => {
      setIsLoading(false);
      setShowRecommendations(true);
      toast.success('Found similar movies for you!');
    }, 1500);
  };

  // Generate similar movies based on the selected movie
  const getSimilarMovies = () => {
    if (!selectedMovie) return [];
    
    // For the demo, we'll just return other movies from the same genre
    // In a real app, this would use a recommendation algorithm
    return genreMovies
      .filter(movie => movie.id !== selectedMovie.id)
      .map(movie => ({
        ...movie,
        similarityScore: Math.floor(Math.random() * 30) + 70 // Random score between 70-99%
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore);
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6">
        You picked {selectedGenre}
      </h2>
      
      {!showRecommendations ? (
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

          {selectedMovie && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-[#2A2A2A] rounded-lg"
            >
              <h3 className="text-[#F5F5F5] text-lg font-semibold mb-2">Selected Movie:</h3>
              <div className="flex items-center gap-4">
                <img 
                  src={selectedMovie.poster} 
                  alt={selectedMovie.title}
                  className="w-20 h-28 object-cover rounded"
                />
                <div>
                  <p className="text-[#F5F5F5] font-medium">{selectedMovie.title}</p>
                  <p className="text-[#AAAAAA]">{selectedMovie.year}</p>
                </div>
              </div>
              <Button 
                onClick={handleDone}
                className="w-full mt-4 bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? 'Finding similar movies...' : (
                  <>
                    <CheckCheck size={18} />
                    Done - Find Similar Movies
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {showSuggestions && (
            <div className="mt-6 space-y-4">
              <h3 className="text-[#F5F5F5] text-lg font-semibold mb-2">
                Popular {selectedGenre} Movies:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {genreMovies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="cursor-pointer"
                    onClick={() => handleMovieSelect(movie)}
                  >
                    <div className={`p-3 rounded-lg transition-all duration-200 ${selectedMovie?.id === movie.id ? 'bg-[#3A3A3A] ring-2 ring-[#8B5CF6]' : 'bg-[#1E1E1E] hover:bg-[#2A2A2A]'}`}>
                      <div className="flex gap-3">
                        <img 
                          src={movie.poster} 
                          alt={movie.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="flex flex-col justify-center">
                          <p className="text-[#F5F5F5] font-medium">{movie.title}</p>
                          <p className="text-[#AAAAAA]">{movie.year}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-[#2A2A2A] rounded-lg flex gap-4 items-center"
          >
            <img 
              src={selectedMovie?.poster} 
              alt={selectedMovie?.title}
              className="w-20 h-28 object-cover rounded"
            />
            <div>
              <h3 className="text-[#F5F5F5] text-lg font-semibold">Based on your selection:</h3>
              <p className="text-[#F5F5F5] font-medium">{selectedMovie?.title} ({selectedMovie?.year})</p>
            </div>
          </motion.div>

          <h3 className="text-2xl font-bold text-[#F5F5F5] mb-4">Recommended Movies:</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {getSimilarMovies().map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]"
              >
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[#F5F5F5] font-bold">{movie.title}</h4>
                    <span className="bg-[#10B981] text-white text-xs px-2 py-1 rounded-full">
                      {movie.similarityScore}% match
                    </span>
                  </div>
                  <p className="text-[#AAAAAA]">{movie.year}</p>
                  <p className="text-[#CCCCCC] mt-2 text-sm">
                    {`A ${selectedGenre.toLowerCase()} film that viewers of ${selectedMovie?.title} also enjoyed.`}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <Button 
            onClick={() => {
              setShowRecommendations(false);
              setSelectedMovie(null);
              setMovieTitle('');
            }}
            className="mt-8 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
          >
            Start Over
          </Button>
        </div>
      )}
    </div>
  );
};
