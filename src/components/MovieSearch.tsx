import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Search, Film, Star, ImageOff, Clock, Calendar, TrendingUp, Award, Theater, Target, User, Hash, Filter, RefreshCw, Zap, History, Calendar as CalendarIcon, Check } from 'lucide-react';
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
    case 'director': return 'bg-blue-600 text-white';
    case 'cast': return 'bg-indigo-500 text-white';
    case 'genre': return 'bg-emerald-500 text-black';
    case 'similar': return 'bg-blue-500 text-white';
    case 'recommend': return 'bg-purple-500 text-white';
    case 'keyword': return 'bg-pink-500 text-white';
    case 'era': return 'bg-orange-500 text-black';
    default: return 'bg-gray-500 text-white';
  }
};

const getSourceLabel = (source?: string): string => {
  switch(source) {
    case 'franchise': return 'Same Series';
    case 'director': return 'Same Director';
    case 'cast': return 'Same Actor';
    case 'genre': return 'Genre Match';
    case 'similar': return 'Similar';
    case 'recommend': return 'Recommended';
    case 'keyword': return 'Theme Match';
    case 'era': return 'Same Era';
    default: return 'Related';
  }
};

const getSourceIcon = (source?: string) => {
  switch(source) {
    case 'franchise': return <Theater className="w-3 h-3" />;
    case 'director': return <User className="w-3 h-3" />;
    case 'cast': return <User className="w-3 h-3" />;
    case 'genre': return <Hash className="w-3 h-3" />;
    case 'similar': return <Target className="w-3 h-3" />;
    case 'recommend': return <Zap className="w-3 h-3" />;
    case 'keyword': return <Filter className="w-3 h-3" />;
    case 'era': return <History className="w-3 h-3" />;
    default: return <Target className="w-3 h-3" />;
  }
};

export const MovieSearch = ({ selectedGenre, directSearchQuery }: MovieSearchProps) => {
  const [movieTitle, setMovieTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState<Movie | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [apiError, setApiError] = useState(false);
  const [sortOption, setSortOption] = useState<'relevance' | 'rating' | 'year' | 'genre' | 'popularity'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [filterSource, setFilterSource] = useState<string | null>(null);

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

  const filteredSimilarMovies = useMemo(() => {
    if (!similarMovies.length) return [];
    
    let filtered = filterSource 
      ? similarMovies.filter(movie => (movie as any).source === filterSource)
      : similarMovies;
      
    if (searchQuery.trim()) {
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [similarMovies, filterSource, searchQuery]);

  const sortedSimilarMovies = useMemo(() => {
    if (!filteredSimilarMovies.length) return [];
    
    const getMovieScore = (movie: Movie) => {
      const genreMatchCount = movie.genres?.filter(g => 
        selectedMovieDetails?.genres?.some(sg => sg.id === g.id)
      ).length || 0;
      
      return genreMatchCount;
    };

    return [...filteredSimilarMovies].sort((a, b) => {
      if ('similarityScore' in a && 'similarityScore' in b) {
        const scoreDiff = (b.similarityScore as number) - (a.similarityScore as number);
        if (scoreDiff !== 0) return scoreDiff;
      }
      
      const aScore = getMovieScore(a);
      const bScore = getMovieScore(b);
      
      switch(sortOption) {
        case 'rating':
          return b.vote_average - a.vote_average;
        case 'year':
          const yearA = a.release_date ? new Date(a.release_date).getFullYear() : 0;
          const yearB = b.release_date ? new Date(b.release_date).getFullYear() : 0;
          return yearB - yearA;
        case 'genre':
          return bScore - aScore;
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'relevance':
        default:
          if (aScore !== bScore) {
            return bScore - aScore;
          }
          
          const aHasScore = 'similarityScore' in a;
          const bHasScore = 'similarityScore' in b;
          
          if (aHasScore && bHasScore) {
            return (b.similarityScore as number) - (a.similarityScore as number);
          }
          
          const scoreA = (a.vote_average * Math.log10((a.vote_count || 1) + 1)) + ((a.popularity || 0) / 100);
          const scoreB = (b.vote_average * Math.log10((b.vote_count || 1) + 1)) + ((b.popularity || 0) / 100);
          return scoreB - scoreA;
      }
    });
  }, [filteredSimilarMovies, sortOption, selectedMovieDetails]);

  const sourceStats = useMemo(() => {
    if (!similarMovies.length) return [];
    
    const counts: Record<string, number> = {};
    
    similarMovies.forEach(movie => {
      const source = (movie as any).source || 'unknown';
      counts[source] = (counts[source] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }, [similarMovies]);

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
        toast.loading('Finding the perfect matches...');
        similar = await getSimilarMovies(selectedMovie.id);
      }
      
      if (similar.length === 0) {
        similar = getFallbackMovies(selectedGenre);
        toast.warning('No similar movies found. Showing some recommendations instead.');
      } else {
        toast.success(`Found ${similar.length} movies you might enjoy!`);
        
        const matchTypes = similar.slice(0, 20).reduce((acc: Record<string, number>, movie) => {
          const source = (movie as any).source || 'unknown';
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {});
        
        console.log('Recommendation breakdown:', matchTypes);
        
        const topSource = Object.entries(matchTypes).sort((a, b) => b[1] - a[1])[0];
        if (topSource) {
          toast.success(`Including ${topSource[1]} ${getSourceLabel(topSource[0])} matches!`);
        }
      }
      
      setSimilarMovies(similar);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Failed to fetch similar movies:', error);
      toast.error('Failed to fetch similar movies');
      const fallbackData = getFallbackMovies(selectedGenre);
      setSimilarMovies(fallbackData);
      setShowRecommendations(true);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    if (!selectedMovie) return;
    
    setIsLoading(true);
    toast.loading('Refreshing recommendations...');
    
    try {
      const similar = await getSimilarMovies(selectedMovie.id);
      if (similar.length > 0) {
        setSimilarMovies(similar);
        toast.success('Found new recommendations for you!');
      }
    } catch (error) {
      toast.error('Failed to refresh recommendations');
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

  const getYear = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).getFullYear();
  };

  const hasGenreMatch = (movieGenres: Genre[] | undefined, referenceGenres: Genre[] | undefined): boolean => {
    if (!movieGenres || !referenceGenres) return false;
    return movieGenres.some(g1 => referenceGenres.some(g2 => g1.id === g2.id));
  };

  const renderMatchReasons = (movie: Movie) => {
    if (!(movie as any).matchReason) return null;
    
    const reasons = (movie as any).matchReason as string[];
    if (!reasons.length) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {reasons.slice(0, 2).map((reason, i) => (
          <span 
            key={i} 
            className="text-xs bg-[#333333] px-2 py-0.5 rounded-full text-[#AAAAAA] flex items-center gap-1"
          >
            <Hash className="w-3 h-3" />
            {reason}
          </span>
        ))}
        {reasons.length > 2 && (
          <span className="text-xs bg-[#333333] px-2 py-0.5 rounded-full text-[#AAAAAA]">
            +{reasons.length - 2} more
          </span>
        )}
      </div>
    );
  };

  if (showRecommendations && selectedMovie) {
    return (
      <div className="p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
          <Film className="w-6 h-6 text-[#8B5CF6]" />
          Movies Similar to "{selectedMovie.title}" 🎬
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
                      <ImageOff className="w-12 h-12 text-[#666666]" />
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

            <div className="mb-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-[#F5F5F5]">
                  Advanced Recommendations:
                </h3>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={refreshRecommendations}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </Button>
                  
                  <Button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'compact' : 'grid')}
                    variant="outline"
                    size="sm"
                  >
                    {viewMode === 'grid' ? 'Compact View' : 'Grid View'}
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <Input
                    type="text"
                    placeholder="Filter results..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-[#1E1E1E] text-[#F5F5F5] border-[#333333]"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {sourceStats.slice(0, 5).map(({source, count}) => (
                    <Button 
                      key={source}
                      onClick={() => setFilterSource(filterSource === source ? null : source)}
                      variant={filterSource === source ? 'default' : 'outline'}
                      className={filterSource === source 
                        ? `${getSourceColor(source)}` 
                        : 'bg-[#2A2A2A]'
                      }
                      size="sm"
                    >
                      {getSourceIcon(source)}
                      <span className="ml-1">{getSourceLabel(source)}</span>
                      <span className="ml-1 text-xs opacity-80">({count})</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
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
                  onClick={() => setSortOption('popularity')} 
                  variant={sortOption === 'popularity' ? 'default' : 'outline'}
                  className={sortOption === 'popularity' ? 'bg-[#8B5CF6]' : 'bg-[#2A2A2A]'}
                  size="sm"
                >
                  Most Popular
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
            
            {sortedSimilarMovies.length > 0 && (
              <div className="mb-4 text-[#AAAAAA]">
                Showing {sortedSimilarMovies.length} 
                {filterSource ? ` ${getSourceLabel(filterSource)}` : ''} 
                {searchQuery ? ` matches for "${searchQuery}"` : ' recommendations'}
              </div>
            )}
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {sortedSimilarMovies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]"
                  >
                    <div className="h-[400px] relative">
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
                            {getSourceIcon((movie as any).source)}
                            {getSourceLabel((movie as any).source)}
                          </div>
                        </div>
                      )}
                      
                      {hasGenreMatch(movie.genres, selectedMovieDetails?.genres) && !(movie as any).source && (
                        <div className="absolute top-2 left-2 rounded-full">
                          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-500 text-black">
                            <Hash className="w-3 h-3" />
                            Genre Match
                          </div>
                        </div>
                      )}
                      
                      {(movie as any).similarityScore && (
                        <div className="absolute bottom-2 right-2 bg-[#1E1E1E] bg-opacity-80 rounded-full">
                          <div className="flex items-center gap-1 px-2 py-1">
                            <Target className="w-3 h-3 text-[#8B5CF6]" />
                            <span className="text-white text-xs font-bold">
                              {Math.min(99, Math.round((movie as any).similarityScore))}% Match
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-2">
                        <h4 className="text-[#F5F5F5] font-bold line-clamp-1">{movie.title}</h4>
                        <div className="flex justify-between items-center">
                          <p className="text-[#AAAAAA] flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {getYear(movie.release_date)}
                          </p>
                          {movie.vote_count && (
                            <span className="text-[#AAAAAA] text-xs">
                              {movie.vote_count.toLocaleString()} votes
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {movie.director && (
                        <div className="flex items-center gap-1 text-[#AAAAAA] text-xs mt-1">
                          <User className="w-3 h-3" />
                          <span>Director: {movie.director}</span>
                        </div>
                      )}
                      
                      {movie.genres && movie.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {movie.genres.slice(0, 3).map(genre => (
                            <span 
                              key={genre.id} 
                              className="text-[10px] bg-[#333333] px-1.5 py-0.5 rounded-full text-[#AAAAAA]"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {renderMatchReasons(movie)}
                      
                      <p className="text-[#DDDDDD] mt-2 text-sm line-clamp-3">
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
            ) : (
              <div className="space-y-3">
                {sortedSimilarMovies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-[#1E1E1E] rounded-lg p-3 flex gap-4 hover:bg-[#262626] transition-colors"
                  >
                    <div className="w-16 h-24 flex-shrink-0 relative rounded overflow-hidden">
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
                      
                      {(movie as any).similarityScore && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#1E1E1E] bg-opacity-90 text-center py-0.5">
                          <span className="text-white text-[10px] font-bold">
                            {Math.min(99, Math.round((movie as any).similarityScore))}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow overflow-hidden">
                      <div className="flex justify-between items-start">
                        <h4 className="text-[#F5F5F5] font-medium line-clamp-1">
                          {movie.title}
                        </h4>
                        
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
                          <span className="text-white text-xs">{movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-[#AAAAAA]">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {getYear(movie.release_date)}
                        </span>
                        
                        {movie.runtime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRuntime(movie.runtime)}
                          </span>
                        )}
                        
                        {movie.director && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {movie.director}
                          </span>
                        )}
                      </div>
                      
                      {(movie as any).source && (
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getSourceColor((movie as any).source)}`}>
                            {getSourceIcon((movie as any).source)}
                            {getSourceLabel((movie as any).source)}
                          </span>
                        </div>
                      )}
                      
                      {renderMatchReasons(movie)}
                      
                      <p className="text-[#DDDDDD] mt-1 text-xs line-clamp-2">
                        {movie.overview}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

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
                      <ImageOff className="w-12 h-12 text-[#666666]" />
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

            <div className="mb-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-[#F5F5F5]">
                  Advanced Recommendations:
                </h3>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={refreshRecommendations}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </Button>
                  
                  <Button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'compact' : 'grid')}
                    variant="outline"
                    size="sm"
                  >
                    {viewMode === 'grid' ? 'Compact View' : 'Grid View'}
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <Input
                    type="text"
                    placeholder="Filter results..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-[#1E1E1E] text-[#F5F5F5] border-[#333333]"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {sourceStats.slice(0, 5).map(({source, count}) => (
                    <Button 
                      key={source}
                      onClick={() => setFilterSource(filterSource === source ? null : source)}
                      variant={filterSource === source ? 'default' : 'outline'}
                      className={filterSource === source 
                        ? `${getSourceColor(source)}` 
                        : 'bg-[#2A2A2A]'
                      }
                      size="sm"
                    >
                      {getSourceIcon(source)}
                      <span className="ml-1">{getSourceLabel(source)}</span>
                      <span className="ml-1 text-xs opacity-80">({count})</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
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
                  onClick={() => setSortOption('popularity')} 
                  variant={sortOption === 'popularity' ? 'default' : 'outline'}
                  className={sortOption === 'popularity' ? 'bg-[#8B5CF6]' : 'bg-[#2A2A2A]'}
                  size="sm"
                >
                  Most Popular
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
            
            {sortedSimilarMovies.length > 0 && (
              <div className="mb-4 text-[#AAAAAA]">
                Showing {sortedSimilarMovies.length} 
                {filterSource ? ` ${getSourceLabel(filterSource)}` : ''} 
                {searchQuery ? ` matches for "${searchQuery}"` : ' recommendations'}
              </div>
            )}
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {sortedSimilarMovies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]"
                  >
                    <div className="h-[400px] relative">
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
                            {getSourceIcon((movie as any).source)}
                            {getSourceLabel((movie as any).source)}
                          </div>
                        </div>
                      )}
                      
                      {hasGenreMatch(movie.genres, selectedMovieDetails?.genres) && !(movie as any).source && (
                        <div className="absolute top-2 left-2 rounded-full">
                          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-500 text-black">
                            <Hash className="w-3 h-3" />
                            Genre Match
                          </div>
                        </div>
                      )}
                      
                      {(movie as any).similarityScore && (
                        <div className="absolute bottom-2 right-2 bg-[#1E1E1E] bg-opacity-80 rounded-full">
                          <div className="flex items-center gap-1 px-2 py-1">
                            <Target className="w-3 h-3 text-[#8B5CF6]" />
                            <span className="text-white text-xs font-bold">
                              {Math.min(99, Math.round((movie as any).similarityScore))}% Match
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="mb-2">
                        <h4 className="text-[#F5F5F5] font-bold line-clamp-1">{movie.title}</h4>
                        <div className="flex justify-between items-center">
                          <p className="text-[#AAAAAA] flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {getYear(movie.release_date)}
                          </p>
                          {movie.vote_count && (
                            <span className="text-[#AAAAAA] text-xs">
                              {movie.vote_count.toLocaleString()} votes
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {movie.director && (
                        <div className="flex items-center gap-1 text-[#AAAAAA] text-xs mt-1">
                          <User className="w-3 h-3" />
                          <span>Director: {movie.director}</span>
                        </div>
                      )}
                      
                      {movie.genres && movie.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {movie.genres.slice(0, 3).map(genre => (
                            <span 
                              key={genre.id} 
                              className="text-[10px] bg-[#333333] px-1.5 py-0.5 rounded-full text-[#AAAAAA]"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {renderMatchReasons(movie)}
                      
                      <p className="text-[#DDDDDD] mt-2 text-sm line-clamp-3">
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
            ) : (
              <div className="space-y-3">
                {sortedSimilarMovies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-[#1E1E1E] rounded-lg p-3 flex gap-4 hover:bg-[#262626] transition-colors"
                  >
                    <div className="w-16 h-24 flex-shrink-0 relative rounded overflow-hidden">
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
                      
                      {(movie as any).similarityScore && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#1E1E1E] bg-opacity-90 text-center py-0.5">
                          <span className="text-white text-[10px] font-bold">
                            {Math.min(99, Math.round((movie as any).similarityScore))}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow overflow-hidden">
                      <div className="flex justify-between items-start">
                        <h4 className="text-[#F5F5F5] font-medium line-clamp-1">
                          {movie.title}
                        </h4>
                        
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
                          <span className="text-white text-xs">{movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-[#AAAAAA]">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {getYear(movie.release_date)}
                        </span>
                        
                        {movie.runtime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRuntime(movie.runtime)}
                          </span>
                        )}
                        
                        {movie.director && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {movie.director}
                          </span>
                        )}
                      </div>
                      
                      {(movie as any).source && (
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getSourceColor((movie as any).source)}`}>
                            {getSourceIcon((movie as any).source)}
                            {getSourceLabel((movie as any).source)}
                          </span>
                        </div>
                      )}
                      
                      {renderMatchReasons(movie)}
                      
                      <p className="text-[#DDDDDD] mt-1 text-xs line-clamp-2">
                        {movie.overview}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-8 space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-[#F5F5F5] text-center">
          {selectedGenre === 'Search' 
            ? 'Search for a movie to find similar films' 
            : selectedGenre === 'Top' 
              ? 'Top Rated IMDB Movies' 
              : `Browse ${selectedGenre} Movies`}
        </h2>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-[#F5F5F5] animate-pulse">Loading movies... ✨</p>
        </div>
      ) : (
        <>
          {!showRecommendations && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredMovies.slice(0, 15).map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleMovieSelect(movie)}
                  className={`bg-[#1E1E1E] rounded-lg overflow-hidden shadow-md transition-all duration-300 cursor-pointer
                    ${selectedMovie?.id === movie.id ? 'ring-2 ring-[#8B5CF6] transform scale-[1.02]' : 'hover:shadow-lg hover:translate-y-[-4px]'}`}
                >
                  <div className="h-[400px] relative">
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
                    
                    {selectedMovie?.id === movie.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <div className="bg-[#8B5CF6] rounded-full p-2">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-[#F5F5F5] font-bold text-lg mb-1 line-clamp-1">{movie.title}</h3>
                    <div className="flex items-center gap-2 mb-2 text-[#AAAAAA] text-sm">
                      {movie.release_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(movie.release_date).getFullYear()}
                        </span>
                      )}
                      
                      {movie.popularity && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {Math.round(movie.popularity)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[#DDDDDD] text-sm line-clamp-3">{movie.overview}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {showRecommendations && !isLoading && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-[#F5F5F5] mb-4">Similar Movies</h3>
              
              {sortedSimilarMovies.length === 0 ? (
                <div className="bg-[#1E1E1E] rounded-lg p-6 text-center">
                  <p className="text-[#F5F5F5]">No similar movies found. Try selecting a different movie.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {sortedSimilarMovies.map((movie, index) => (
                    <motion.div
                      key={movie.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]"
                    >
                      <div className="h-[400px] relative">
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
                              {getSourceIcon((movie as any).source)}
                              {getSourceLabel((movie as any).source)}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h4 className="text-[#F5F5F5] font-bold line-clamp-1">{movie.title}</h4>
                        <div className="flex justify-between items-center">
                          <p className="text-[#AAAAAA] flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {getYear(movie.release_date)}
                          </p>
                        </div>
                        
                        <p className="text-[#DDDDDD] mt-2 text-sm line-clamp-3">
                          {movie.overview}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {!showRecommendations && !isLoading && selectedMovie && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleDone}
            size="lg"
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium px-8"
          >
            <Film className="mr-2 h-5 w-5" />
            Find Similar Movies
          </Button>
        </div>
      )}
      
      {showRecommendations && !isLoading && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => {
              setShowRecommendations(false);
              setSimilarMovies([]);
              setSelectedMovie(null);
            }}
            size="lg"
            className="bg-[#333333] hover:bg-[#444444] text-white font-medium px-8"
          >
            Search Again
          </Button>
        </div>
      )}
    </div>
  );
};
