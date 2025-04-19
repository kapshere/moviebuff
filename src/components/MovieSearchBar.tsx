
import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Film } from 'lucide-react';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { searchMovies } from '@/services/searchService';
import { Movie } from '@/types/movie.types';

interface MovieSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  showRecent?: boolean;
  genre?: string;
}

export const MovieSearchBar = ({ 
  onSearch, 
  placeholder = 'Search for movies...', 
  initialValue = '',
  showRecent = true,
  genre
}: MovieSearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const saved = localStorage.getItem('recentMovieSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  }, []);
  
  // Fetch search results when search query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const results = await searchMovies(searchQuery.trim());
        setSearchResults(results.slice(0, 5)); // Limit to 5 results for dropdown
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(fetchResults, 300); // Debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Save to recent searches
    const trimmedQuery = searchQuery.trim();
    const updatedSearches = [
      trimmedQuery,
      ...recentSearches.filter(s => s !== trimmedQuery)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentMovieSearches', JSON.stringify(updatedSearches));
    
    onSearch(trimmedQuery);
    setShowDropdown(false);
  };
  
  const filteredRecentSearches = useMemo(() => {
    if (!searchQuery.trim()) return recentSearches;
    return recentSearches.filter(search => 
      search.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recentSearches, searchQuery]);
  
  const handleClearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentMovieSearches');
    toast.success('Search history cleared');
  };
  
  const handleSelectResult = (movie: Movie) => {
    // Save the movie title to recent searches
    const updatedSearches = [
      movie.title,
      ...recentSearches.filter(s => s !== movie.title)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentMovieSearches', JSON.stringify(updatedSearches));
    
    setSearchQuery(movie.title);
    onSearch(movie.title);
    setShowDropdown(false);
  };
  
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(e.target.value.trim().length >= 2);
            }}
            onFocus={() => setShowDropdown(searchQuery.trim().length >= 2)}
            placeholder={genre ? `Search in ${genre}...` : placeholder}
            className="pl-10 bg-[#1A1A1A] border-[#333333] text-[#E0E0E0]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] h-4 w-4" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowDropdown(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#999999]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {/* Search Results Dropdown */}
          {showDropdown && searchQuery.trim().length >= 2 && (
            <div className="absolute z-50 mt-1 w-full rounded-md bg-[#1E1E1E] border border-[#333333] shadow-lg">
              {isLoading && (
                <div className="p-2 text-center text-[#999999]">
                  Searching...
                </div>
              )}
              
              {!isLoading && searchResults.length === 0 && (
                <div className="p-2 text-center text-[#999999]">
                  No results found
                </div>
              )}
              
              {!isLoading && searchResults.length > 0 && (
                <ul className="max-h-72 overflow-auto">
                  {searchResults.map((movie) => (
                    <li key={movie.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectResult(movie)}
                        className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-[#333333] transition-colors"
                      >
                        {movie.poster_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                            alt={movie.title}
                            className="h-12 w-8 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-8 bg-[#333333] rounded flex items-center justify-center">
                            <Film className="h-4 w-4 text-[#666666]" />
                          </div>
                        )}
                        <div>
                          <div className="text-[#E0E0E0] font-medium">{movie.title}</div>
                          <div className="text-xs text-[#999999]">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown year'}
                            {movie.vote_average > 0 && ` • ${movie.vote_average.toFixed(1)}/10`}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <Button type="submit" className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
          Search
        </Button>
      </form>
      
      {showRecent && filteredRecentSearches.length > 0 && !searchQuery && (
        <div className="mt-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm text-[#999999]">Recent Searches</h3>
            <button 
              onClick={handleClearHistory}
              className="text-xs text-[#8B5CF6] hover:text-[#7C3AED]"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {filteredRecentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(search);
                  onSearch(search);
                }}
                className="px-3 py-1 text-sm bg-[#1E1E1E] text-[#E0E0E0] rounded-full hover:bg-[#333333] transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
