import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCheck, Search, Film, Star, ImageOff } from 'lucide-react';
import { 
  getMoviesByGenre, 
  getSimilarMovies, 
  getFallbackMovies, 
  type Movie 
} from '@/services/movieService';

interface MovieSearchProps {
  selectedGenre: string;
}

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
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setApiError(false);
        
        const genreId = genreIds[selectedGenre];
        let fetchedMovies: Movie[] = [];
        
        if (genreId) {
          fetchedMovies = await getMoviesByGenre(genreId);
        }
        
        if (fetchedMovies.length === 0) {
          console.log('Using fallback movies for', selectedGenre);
          fetchedMovies = getFallbackMovies(selectedGenre);
          setApiError(true);
          toast.error('Could not connect to the movie database API. Using sample data instead.');
        }
        
        setMovies(fetchedMovies);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setApiError(true);
        setMovies(getFallbackMovies(selectedGenre));
        toast.error('Failed to load movies from the API. Using sample data instead.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [selectedGenre]);

  const filteredMovies = useMemo(() => {
    if (!movieTitle.trim()) return movies;
    return movies.filter(movie => 
      movie.title.toLowerCase().includes(movieTitle.toLowerCase())
    );
  }, [movies, movieTitle]);

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
      let similar: Movie[] = [];
      
      if (apiError) {
        similar = getFallbackMovies(selectedGenre).filter(m => m.id !== selectedMovie.id);
      } else {
        similar = await getSimilarMovies(selectedMovie.id);
      }
      
      if (similar.length === 0) {
        similar = getFallbackMovies(selectedGenre);
        toast.warning('No similar movies found. Showing some recommendations instead.');
      } else {
        toast.success('Found similar movies for you!');
      }
      
      setSimilarMovies(similar);
      setShowRecommendations(true);
    } catch (error) {
      toast.error('Failed to fetch similar movies');
      setSimilarMovies(getFallbackMovies(selectedGenre));
    } finally {
      setIsLoading(false);
    }
  };

  const getPosterUrl = (path: string | null) => {
    if (!path) {
      return '/placeholder.svg';
    }
    
    if (path.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w500${path}`;
    }
    return path;
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
        <Film className="w-6 h-6 text-[#8B5CF6]" />
        You picked {selectedGenre} 🎬
      </h2>
      
      {isLoading && (
        <div className="w-full text-center py-8">
          <p className="text-[#F5F5F5] animate-pulse">Loading amazing movies... ✨</p>
        </div>
      )}
      
      {!isLoading && !showRecommendations ? (
        <div className="w-full max-w-md space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search movies..."
              value={movieTitle}
              onChange={(e) => setMovieTitle(e.target.value)}
              className="bg-[#1E1E1E] text-[#F5F5F5] border-[#333333] pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] w-4 h-4" />
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-[#F5F5F5] text-lg font-semibold mb-2 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#FFD700]" />
              Popular {selectedGenre} Movies:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="cursor-pointer"
                  onClick={() => handleMovieSelect(movie)}
                >
                  <div className={`p-3 rounded-lg transition-all duration-200 ${
                    selectedMovie?.id === movie.id 
                      ? 'bg-[#3A3A3A] ring-2 ring-[#8B5CF6] transform scale-105' 
                      : 'bg-[#1E1E1E] hover:bg-[#2A2A2A] hover:transform hover:scale-102'
                  }`}>
                    <div className="flex gap-3">
                      <div className="w-16 h-24 relative rounded shadow-lg overflow-hidden">
                        {movie.poster_path ? (
                          <img 
                            src={getPosterUrl(movie.poster_path)}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                            <ImageOff className="w-8 h-8 text-[#666666]" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between py-1">
                        <div>
                          <p className="text-[#F5F5F5] font-medium line-clamp-2">{movie.title}</p>
                          <p className="text-[#AAAAAA] text-sm">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'} 📅
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[#FFD700]">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{movie.vote_average.toFixed(1)}/10</span>
                        </div>
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
              className="mt-4 p-4 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]"
            >
              <h3 className="text-[#F5F5F5] text-lg font-semibold mb-2 flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-[#10B981]" />
                Selected Movie:
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-28 relative rounded shadow-lg overflow-hidden">
                  {selectedMovie.poster_path ? (
                    <img 
                      src={getPosterUrl(selectedMovie.poster_path)}
                      alt={selectedMovie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                      <ImageOff className="w-8 h-8 text-[#666666]" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[#F5F5F5] font-medium">{selectedMovie.title}</p>
                  <p className="text-[#AAAAAA]">
                    {selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : 'Unknown'} 📅
                  </p>
                  <div className="flex items-center gap-1 text-[#FFD700] mt-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">{selectedMovie.vote_average.toFixed(1)}/10</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleDone}
                className="w-full mt-4 bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? 'Finding similar movies... 🔍' : (
                  <>
                    <CheckCheck size={18} />
                    Find Similar Movies ✨
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      ) : !isLoading && (
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-[#2A2A2A] rounded-lg flex gap-4 items-center"
          >
            <div className="w-20 h-28 relative rounded shadow-lg overflow-hidden">
              {selectedMovie?.poster_path ? (
                <img 
                  src={getPosterUrl(selectedMovie.poster_path)}
                  alt={selectedMovie?.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                  <ImageOff className="w-8 h-8 text-[#666666]" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-[#F5F5F5] text-lg font-semibold">Based on your selection:</h3>
              <p className="text-[#F5F5F5] font-medium">
                {selectedMovie?.title} 
                {selectedMovie?.release_date && 
                  ` (${new Date(selectedMovie.release_date).getFullYear()})`
                }
              </p>
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
                <div className="h-48 relative">
                  {movie.poster_path ? (
                    <img 
                      src={getPosterUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                      <ImageOff className="w-12 h-12 text-[#666666]" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[#F5F5F5] font-bold">{movie.title}</h4>
                    <span className="bg-[#10B981] text-white text-xs px-2 py-1 rounded-full">
                      {movie.vote_average.toFixed(1)}/10
                    </span>
                  </div>
                  <p className="text-[#AAAAAA]">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                  </p>
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
