
import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';

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
  
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={genre ? `Search in ${genre}...` : placeholder}
            className="pl-10 bg-[#1A1A1A] border-[#333333] text-[#E0E0E0]"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] h-4 w-4" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666666] hover:text-[#999999]"
            >
              <X className="h-4 w-4" />
            </button>
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
