
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCheck } from 'lucide-react';
import { getMoviesByGenre, getSimilarMovies, type Movie } from '@/services/movieService';

interface MovieSearchProps {
  selectedGenre: string;
}

// Genre ID mapping for TMDB API
const genreIds: Record<string, number> = {
  'Action': 28,
  'Comedy': 35,
  'Drama': 18,
  'Horror': 27,
  'Thriller': 53,
  'Romance': 10749,
  'Science Fiction': 878,
  'Family': 10751,
  'Adventure': 12,
  'Animation': 16
};

export const MovieSearch = ({ selectedGenre }: MovieSearchProps) => {
  const [movieTitle, setMovieTitle] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const genreId = genreIds[selectedGenre];
        if (genreId) {
          setIsLoading(true);
          const fetchedMovies = await getMoviesByGenre(genreId);
          setMovies(fetchedMovies);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
        toast.error('Failed to load movies');
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [selectedGenre]);

  const handleMovieSelect = (movie: Movie) => {
    setMovieTitle(movie.title);
    setSelectedMovie(movie);
  };

  const handleDone = async () => {
    if (!selectedMovie) {
      toast.error('Please select a movie first');
      return;
    }
    
    setIsLoading(true);
    try {
      const similar = await getSimilarMovies(selectedMovie.id);
      setSimilarMovies(similar);
      setShowRecommendations(true);
      toast.success('Found similar movies for you!');
    } catch (error) {
      toast.error('Failed to fetch similar movies');
    } finally {
      setIsLoading(false);
    }
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

          <div className="mt-6 space-y-4">
            <h3 className="text-[#F5F5F5] text-lg font-semibold mb-2">
              Popular {selectedGenre} Movies:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {movies.map((movie, index) => (
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
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex flex-col justify-center">
                        <p className="text-[#F5F5F5] font-medium">{movie.title}</p>
                        <p className="text-[#AAAAAA]">{new Date(movie.release_date).getFullYear()}</p>
                        <p className="text-[#AAAAAA] text-sm">Rating: {movie.vote_average.toFixed(1)}/10</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {selectedMovie && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-[#2A2A2A] rounded-lg"
            >
              <h3 className="text-[#F5F5F5] text-lg font-semibold mb-2">Selected Movie:</h3>
              <div className="flex items-center gap-4">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                  alt={selectedMovie.title}
                  className="w-20 h-28 object-cover rounded"
                />
                <div>
                  <p className="text-[#F5F5F5] font-medium">{selectedMovie.title}</p>
                  <p className="text-[#AAAAAA]">{new Date(selectedMovie.release_date).getFullYear()}</p>
                  <p className="text-[#AAAAAA] text-sm">Rating: {selectedMovie.vote_average.toFixed(1)}/10</p>
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
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-[#2A2A2A] rounded-lg flex gap-4 items-center"
          >
            <img 
              src={`https://image.tmdb.org/t/p/w500${selectedMovie?.poster_path}`}
              alt={selectedMovie?.title}
              className="w-20 h-28 object-cover rounded"
            />
            <div>
              <h3 className="text-[#F5F5F5] text-lg font-semibold">Based on your selection:</h3>
              <p className="text-[#F5F5F5] font-medium">{selectedMovie?.title} ({selectedMovie?.release_date && new Date(selectedMovie.release_date).getFullYear()})</p>
            </div>
          </motion.div>

          <h3 className="text-2xl font-bold text-[#F5F5F5] mb-4">Recommended Movies:</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {similarMovies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]"
              >
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[#F5F5F5] font-bold">{movie.title}</h4>
                    <span className="bg-[#10B981] text-white text-xs px-2 py-1 rounded-full">
                      {movie.vote_average.toFixed(1)}/10
                    </span>
                  </div>
                  <p className="text-[#AAAAAA]">{new Date(movie.release_date).getFullYear()}</p>
                  <p className="text-[#CCCCCC] mt-2 text-sm line-clamp-3">
                    {movie.overview}
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

