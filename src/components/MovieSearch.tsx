import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CheckCheck, Search, Film, Star, ImageOff, Clock, Users, Calendar, TrendingUp, Award, Theater, Target } from 'lucide-react';
import { 
  getMoviesByGenre,
  searchMovies,
  getSimilarMovies,
  getTopIMDBMovies,
  getMovieDetails,
  getFallbackMovies, 
  type Movie,
  type Genre
} from '@/services/movieService';

interface MovieSearchProps {
  selectedGenre: string;
  directSearchQuery?: string;
}

const genreIds: Record<string, number> = {
  'Action': 28,
  'Comedy': 35,
  'Drama': 18,
  'Horror': 27,
  'Thriller': 53,
  'Romance': 10749,
  'Science': 878,
  'Family': 10751,
  'Adventure': 12,
  'Animation': 16,
  'Crime': 80,
  'Documentary': 99,
  'Fantasy': 14,
  'History': 36,
  'Music': 10402,
  'Mystery': 9648
};

const getSourceColor = (source?: string): string => {
  switch(source) {
    case 'franchise': return 'bg-amber-500 text-black';
    case 'genre': return 'bg-emerald-500 text-black';
    case 'similar': return 'bg-blue-500 text-white';
    case 'recommend': return 'bg-purple-500 text-white';
    case 'keyword': return 'bg-pink-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getSourceLabel = (source?: string): string => {
  switch(source) {
    case 'franchise': return 'Same Series';
    case 'genre': return 'Genre Match';
    case 'similar': return 'Similar';
    case 'recommend': return 'Recommended';
    case 'keyword': return 'Theme Match';
    default: return 'Related';
  }
};

export const MovieSearch = ({ selectedGenre, directSearchQuery }: MovieSearchProps) => {
  const [movieTitle, setMovieTitle] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState<Movie | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [apiError, setApiError] = useState(false);
  const [sortOption, setSortOption] = useState<'relevance' | 'rating' | 'year' | 'genre'>('relevance');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setApiError(false);
        
        let fetchedMovies: Movie[] = [];
        
        if (selectedGenre === 'Search' && directSearchQuery) {
          console.log('Searching for movies like:', directSearchQuery);
          fetchedMovies = await searchMovies(directSearchQuery);
          
          if (fetchedMovies.length > 0) {
            setSelectedMovie(fetchedMovies[0]);
            
            const details = await getMovieDetails(fetchedMovies[0].id);
            if (details) {
              setSelectedMovieDetails(details);
            }
            
            const similar = await getSimilarMovies(fetchedMovies[0].id);
            if (similar.length > 0) {
              setSimilarMovies(similar);
              setShowRecommendations(true);
              setIsLoading(false);
              return;
            }
          } else {
            toast.error(`No movies found matching "${directSearchQuery}". Try a different search.`);
          }
        } else if (selectedGenre === 'Top') {
          fetchedMovies = await getTopIMDBMovies();
        } else {
          const genreId = genreIds[selectedGenre];
          if (genreId) {
            fetchedMovies = await getMoviesByGenre(genreId);
          }
        }
        
        if (fetchedMovies.length === 0) {
          console.log('Using fallback movies for', selectedGenre);
          fetchedMovies = getFallbackMovies(selectedGenre);
          setApiError(true);
          toast.error('Could not connect to the movie database API. Using sample data instead.');
        } else {
          console.log(`Loaded ${fetchedMovies.length} movies for ${selectedGenre}`);
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
  }, [selectedGenre, directSearchQuery]);

  const filteredMovies = useMemo(() => {
    if (!movieTitle.trim()) return movies;
    return movies.filter(movie => 
      movie.title.toLowerCase().includes(movieTitle.toLowerCase())
    );
  }, [movies, movieTitle]);

  const sortedSimilarMovies = useMemo(() => {
    if (!similarMovies.length) return [];
    
    switch(sortOption) {
      case 'rating':
        return [...similarMovies].sort((a, b) => b.vote_average - a.vote_average);
      case 'year':
        return [...similarMovies].sort((a, b) => {
          const yearA = a.release_date ? new Date(a.release_date).getFullYear() : 0;
          const yearB = b.release_date ? new Date(b.release_date).getFullYear() : 0;
          return yearB - yearA;
        });
      case 'genre':
        return [...similarMovies].sort((a, b) => {
          if (!selectedMovieDetails?.genres) return 0;
          
          const aGenreMatch = a.genres?.filter(g => 
            selectedMovieDetails.genres?.some(sg => sg.id === g.id)
          ).length || 0;
          
          const bGenreMatch = b.genres?.filter(g => 
            selectedMovieDetails.genres?.some(sg => sg.id === g.id)
          ).length || 0;
          
          return bGenreMatch - aGenreMatch;
        });
      case 'relevance':
      default:
        return [...similarMovies].sort((a: any, b: any) => {
          if (a.score !== undefined && b.score !== undefined) {
            return b.score - a.score;
          }
          
          const scoreA = (a.vote_average * Math.log10((a.vote_count || 1) + 1)) + ((a.popularity || 0) / 100);
          const scoreB = (b.vote_average * Math.log10((b.vote_count || 1) + 1)) + ((b.popularity || 0) / 100);
          return scoreB - scoreA;
        });
    }
  }, [similarMovies, sortOption, selectedMovieDetails]);

  const handleMovieSelect = async (movie: Movie) => {
    setMovieTitle(movie.title);
    setSelectedMovie(movie);
    
    try {
      const details = await getMovieDetails(movie.id);
      if (details) {
        setSelectedMovieDetails(details);
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
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

  const getBackdropUrl = (path: string | null) => {
    if (!path) {
      return null;
    }
    
    if (path.startsWith('/')) {
      return `https://image.tmdb.org/t/p/original${path}`;
    }
    return path;
  };

  const renderMovieGenres = (genreList: Genre[] | undefined) => {
    if (!genreList || genreList.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {genreList.map(genre => (
          <span key={genre.id} className="text-xs bg-[#333333] px-2 py-1 rounded-full text-[#AAAAAA]">
            {genre.name}
          </span>
        ))}
      </div>
    );
  };

  const formatRuntime = (minutes: number | undefined) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const hasGenreMatch = (movieGenres: Genre[] | undefined, referenceGenres: Genre[] | undefined): boolean => {
    if (!movieGenres || !referenceGenres) return false;
    return movieGenres.some(g1 => referenceGenres.some(g2 => g1.id === g2.id));
  };

  if (showRecommendations && selectedGenre === 'Search' && directSearchQuery) {
    return (
      <div className="p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
          <Film className="w-6 h-6 text-[#8B5CF6]" />
          Similar to "{directSearchQuery}" 🎬
        </h2>
        
        {isLoading && (
          <div className="w-full text-center py-8">
            <p className="text-[#F5F5F5] animate-pulse">Finding the perfect movies for you... ✨</p>
          </div>
        )}
        
        {!isLoading && selectedMovie && (
          <div className="w-full max-w-4xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 rounded-xl overflow-hidden relative"
            >
              {selectedMovieDetails?.backdrop_path && (
                <div className="absolute inset-0 w-full h-full">
                  <div 
                    className="w-full h-full bg-cover bg-center" 
                    style={{ 
                      backgroundImage: `url('${getBackdropUrl(selectedMovieDetails.backdrop_path)}')`,
                      filter: 'blur(2px)',
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-70" />
                </div>
              )}
              
              <div className="relative p-6 flex gap-6 items-start z-10">
                <div className="w-32 h-48 flex-shrink-0 relative rounded-lg shadow-lg overflow-hidden">
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
                      <ImageOff className="w-10 h-10 text-[#666666]" />
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-[#F5F5F5] text-2xl font-bold">
                    {selectedMovie?.title} 
                    {selectedMovie?.release_date && 
                      <span className="ml-2 text-[#AAAAAA] text-lg font-normal">
                        ({new Date(selectedMovie.release_date).getFullYear()})
                      </span>
                    }
                  </h3>
                  
                  {selectedMovieDetails?.tagline && (
                    <p className="text-[#10B981] italic mt-1">{selectedMovieDetails.tagline}</p>
                  )}
                  
                  {renderMovieGenres(selectedMovieDetails?.genres)}
                  
                  <div className="mt-3 flex flex-wrap gap-5">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
                      <span className="text-[#F5F5F5]">
                        {selectedMovie.vote_average.toFixed(1)}/10
                        {selectedMovie.vote_count && 
                          <span className="text-[#AAAAAA] text-xs ml-1">
                            ({selectedMovie.vote_count.toLocaleString()} votes)
                          </span>
                        }
                      </span>
                    </div>
                    
                    {selectedMovieDetails?.runtime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-[#AAAAAA]" />
                        <span className="text-[#F5F5F5]">{formatRuntime(selectedMovieDetails.runtime)}</span>
                      </div>
                    )}
                    
                    {selectedMovie.popularity && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-[#AAAAAA]" />
                        <span className="text-[#F5F5F5]">{Math.round(selectedMovie.popularity)} popularity</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-[#DDDDDD] mt-4">
                    {selectedMovie?.overview}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#F5F5F5]">Advanced Recommendations:</h3>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setSortOption('relevance')} 
                  variant={sortOption === 'relevance' ? 'default' : 'outline'}
                  className={sortOption === 'relevance' ? 'bg-[#8B5CF6]' : 'bg-[#2A2A2A]'}
                  size="sm"
                >
                  Relevance
                </Button>
                <Button 
                  onClick={() => setSortOption('rating')} 
                  variant={sortOption === 'rating' ? 'default' : 'outline'}
                  className={sortOption === 'rating' ? 'bg-[#8B5CF6]' : 'bg-[#2A2A2A]'}
                  size="sm"
                >
                  Top Rated
                </Button>
                <Button 
                  onClick={() => setSortOption('genre')} 
                  variant={sortOption === 'genre' ? 'default' : 'outline'}
                  className={sortOption === 'genre' ? 'bg-[#8B5CF6]' : 'bg-[#2A2A2A]'}
                  size="sm"
                >
                  Genre Match
                </Button>
                <Button 
                  onClick={() => setSortOption('year')} 
                  variant={sortOption === 'year' ? 'default' : 'outline'}
                  className={sortOption === 'year' ? 'bg-[#8B5CF6]' : 'bg-[#2A2A2A]'}
                  size="sm"
                >
                  Newest
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sortedSimilarMovies.map((movie, index) => (
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
                    <div className="absolute top-2 right-2 bg-[#1E1E1E] bg-opacity-80 rounded-full p-1">
                      <div className="flex items-center gap-1 px-2 py-1">
                        <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
                        <span className="text-white text-xs font-bold">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    {(movie as any).source && (
                      <div className="absolute top-2 left-2 rounded-full">
                        <div className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getSourceColor((movie as any).source)}`}>
                          {(movie as any).source === 'franchise' ? (
                            <Theater className="w-3 h-3" />
                          ) : (
                            <Target className="w-3 h-3" />
                          )}
                          {getSourceLabel((movie as any).source)}
                        </div>
                      </div>
                    )}
                    
                    {hasGenreMatch(movie.genres, selectedMovieDetails?.genres) && !(movie as any).source && (
                      <div className="absolute top-2 left-2 rounded-full">
                        <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-500 text-black">
                          <Target className="w-3 h-3" />
                          Genre Match
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      <h4 className="text-[#F5F5F5] font-bold line-clamp-1">{movie.title}</h4>
                      <div className="flex justify-between items-center">
                        <p className="text-[#AAAAAA]">
                          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                        </p>
                        {movie.vote_count && (
                          <span className="text-[#AAAAAA] text-xs">
                            {movie.vote_count.toLocaleString()} votes
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[#CCCCCC] mt-2 text-sm line-clamp-3">
                      {movie.overview}
                    </p>
                    {movie.popularity && (
                      <div className="mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-[#AAAAAA]" />
                        <span className="text-[#AAAAAA] text-xs">
                          {Math.round(movie.popularity)} popularity
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button 
              onClick={() => {
                setShowRecommendations(false);
                setSelectedMovie(null);
                setSelectedMovieDetails(null);
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
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
        <Film className="w-6 h-6 text-[#8B5CF6]" />
        {selectedGenre === 'Top' ? (
          <span className="flex items-center gap-2">
            Top IMDB Movies <Award className="w-5 h-5 text-[#FFD700]" />
          </span>
        ) : (
          `Most Popular ${selectedGenre} Movies 🔥`
        )}
      </h2>
      
      {isLoading && (
        <div className="w-full text-center py-8">
          <p className="text-[#F5F5F5] animate-pulse">Loading amazing movies... ✨</p>
        </div>
      )}
      
      {!isLoading && !showRecommendations ? (
        <div className="w-full max-w-4xl">
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
              {selectedGenre === 'Top' ? (
                <Award className="w-5 h-5 text-[#FFD700]" />
              ) : (
                <TrendingUp className="w-5 h-5 text-[#FFD700]" />
              )}
              {selectedGenre === 'Top' ? 'Highest Rated Movies:' : `Trending ${selectedGenre} Movies:`}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
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
                          <div className="flex items-center gap-2 text-[#AAAAAA] text-sm">
                            <span>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'} 📅</span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {Math.round(movie.popularity)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[#FFD700]">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{movie.vote_average.toFixed(1)}/10</span>
                          {movie.vote_count && (
                            <span className="text-[#AAAAAA] text-xs ml-1">
                              ({(movie.vote_count/1000).toFixed(1)}K)
                            </span>
                          )}
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
              className="mt-6 p-4 bg-[#2A2A2A] rounded-lg border border-[#3A3A3A]"
            >
              <h3 className="text-[#F5F5F5] text-lg font-semibold mb-2 flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-[#10B981]" />
                Selected Movie:
              </h3>
              
              <div className="flex items-start gap-4">
                <div className="w-20 h-28 relative rounded shadow-lg overflow-hidden">
                  {selectedMovie.poster_path ? (
                    <img 
                      src={getPosterUrl(selectedMovie?.poster_path)}
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
                
                <div className="flex-grow">
                  <p className="text-[#F5F5F5] font-medium">{selectedMovie.title}</p>
                  <p className="text-[#AAAAAA]">
                    {selectedMovie.release_date ? new Date(selectedMovie.release_date).getFullYear() : 'Unknown'} 📅
                  </p>
                  
                  {renderMovieGenres(selectedMovieDetails?.genres)}
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-[#FFD700]">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">{selectedMovie.vote_average.toFixed(1)}/10</span>
                    </div>
                    
                    {selectedMovieDetails?.runtime && (
                      <div className="flex items-center gap-1 text-[#AAAAAA]">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{formatRuntime(selectedMovieDetails.runtime)}</span>
                      </div>
                    )}
                    
                    {selectedMovie.vote_count && (
                      <div className="flex items-center gap-1 text-[#AAAAAA]">
                        <Users className="w-3 h-3" />
                        <span className="text-xs">{selectedMovie.vote_count.toLocaleString()} votes</span>
                      </div>
                    )}
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
                    Find Movies Like This ✨
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
            className="mb-6 rounded-xl overflow-hidden relative"
          >
            {selectedMovieDetails?.backdrop_path && (
              <div className="absolute inset-0 w-full h-full">
                <div 
                  className="w-full h-full bg-cover bg-center" 
                  style={{ 
                    backgroundImage: `url('${getBackdropUrl(selectedMovieDetails.backdrop_path)}')`,
                    filter: 'blur(2px)',
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-70" />
              </div>
            )}
            
            <div className="relative p-6 flex gap-6 items-start z-10">
              <div className="w-32 h-48 flex-shrink-0 relative rounded-lg shadow-lg overflow-hidden">
                {selectedMovie?.poster_path ? (
                  <img 
                    src={getPosterUrl(selectedMovie?.poster_path)}
                    alt={selectedMovie?.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                    <ImageOff className="w-10 h-10 text-[#666666]" />
                  </div>
                )}
              </div>
              
              <div className="flex-grow">
                <h3 className="text-[#F5F5F5] text-2xl font-bold">
                  {selectedMovie?.title} 
                  {selectedMovie?.release_date && 
                    <span className="ml-2 text-[#AAAAAA] text-lg font-normal">
                      ({new Date(selectedMovie.release_date).getFullYear()})
                    </span>
                  }
                </h3>
                
                {selectedMovieDetails?.tagline && (
                  <p className="text-[#10B981] italic mt-1">{selectedMovieDetails.tagline}</p>
                )}
                
                {renderMovieGenres(selectedMovieDetails?.genres)}
                
                <div className="mt-3 flex flex-wrap gap-5">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
                    <span className="text-[#F5F5F5]">
                      {selectedMovie?.vote_average.toFixed(1)}/10
                      {selectedMovie?.vote_count && 
                        <span className="text-[#AAAAAA] text-xs ml-1">
                          ({selectedMovie.vote_count.toLocaleString()} votes)
                        </span>
                      }
                    </span>
                  </div>
                  
                  {selectedMovieDetails?.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#AAAAAA]" />
                      <span className="text-[#F5F5F5]">{formatRuntime(selectedMovieDetails.runtime)}</span>
                    </div>
                  )}
                  
                  {selectedMovie?.popularity && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-[#AAAAAA]" />
                      <span className="text-[#F5F5F5]">{Math.round(selectedMovie.popularity)} popularity</span>
                    </div>
                  )}
                </div>
                
                <p className="text-[#DDDDDD] mt-4">
                  {selectedMovie?.overview}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-[#F5F5F5]">Advanced Recommendations:</h3>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setSortOption('relevance')} 
                variant={sortOption === 'relevance' ? 'default' : 'outline'}
                className={sortOption === 'relevance' ? 'bg-[#8B5CF6]' : 'bg-[#2A2A2A]'}
                size="sm"
              >
                Relevance
              </Button>
              <Button 
                onClick={() => setSortOption('rating')} 
                variant={sortOption === 'rating' ? 'default' : 'outline'}
                className={sortOption === 'rating' ? 'bg-[#8B5CF6]' : 'bg-[#2A2A2A]'}
                size="sm"
              >
                Top Rated
              </Button>
              <Button 
                onClick={() => setSortOption('genre')} 
                variant={sortOption === 'genre' ? 'default' : 'outline'}
                className={sortOption === 'genre' ? 'bg-[#8B5CF6]' : 'bg-[#2A2A2A]'}
                size="sm"
              >
                Genre Match
              </Button>
              <Button 
                onClick={() => setSortOption('year')} 
                variant={sortOption === 'year' ? 'default' : 'outline'}
                className={sortOption === 'year' ? 'bg-[#8B5CF6]' : 'bg-[#2A2A2A]'}
                size="sm"
              >
                Newest
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {sortedSimilarMovies.map((movie, index) => (
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
                  <div className="absolute top-2 right-2 bg-[#1E1E1E] bg-opacity-80 rounded-full p-1">
                    <div className="flex items-center gap-1 px-2 py-1">
                      <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
                      <span className="text-white text-xs font-bold">{movie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  {(movie as any).source && (
                    <div className="absolute top-2 left-2 rounded-full">
                      <div className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getSourceColor((movie as any).source)}`}>
                        {(movie as any).source === 'franchise' ? (
                          <Theater className="w-3 h-3" />
                        ) : (
                          <Target className="w-3 h-3" />
                        )}
                        {getSourceLabel((movie as any).source)}
                      </div>
                    </div>
                  )}
                  
                  {hasGenreMatch(movie.genres, selectedMovieDetails?.genres) && !(movie as any).source && (
                    <div className="absolute top-2 left-2 rounded-full">
                      <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-500 text-black">
                        <Target className="w-3 h-3" />
                        Genre Match
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2">
                    <h4 className="text-[#F5F5F5] font-bold line-clamp-1">{movie.title}</h4>
                    <div className="flex justify-between items-center">
                      <p className="text-[#AAAAAA]">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                      </p>
                      {movie.vote_count && (
                        <span className="text-[#AAAAAA] text-xs">
                          {movie.vote_count.toLocaleString()} votes
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[#CCCCCC] mt-2 text-sm line-clamp-3">
                    {movie.overview}
                  </p>
                  {movie.popularity && (
                    <div className="mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-[#AAAAAA]" />
                      <span className="text-[#AAAAAA] text-xs">
                        {Math.round(movie.popularity)} popularity
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
