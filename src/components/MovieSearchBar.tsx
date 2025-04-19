
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { useQuery } from '@tanstack/react-query';
import { searchMovies } from '@/services/movieService';
import { toast } from 'sonner';

interface MovieSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  moodFilter?: 'happy' | 'dark' | 'action' | 'thoughtful' | 'emotional';
}

export const MovieSearchBar = ({ onSearch, placeholder = "Search movies...", moodFilter }: MovieSearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: suggestions = [], isLoading, isError } = useQuery({
    queryKey: ['movieSuggestions', searchTerm, moodFilter],
    queryFn: () => searchMovies(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2, // Retry failed requests twice
    meta: {
      onError: () => {
        toast.error("Couldn't connect to the movie database. Using sample data instead.");
      }
    }
  });

  // Filter suggestions by mood if a mood is selected
  const filteredSuggestions = useMemo(() => {
    if (!moodFilter || !suggestions.length) return suggestions;
    
    return suggestions.filter(movie => {
      const overview = movie.overview?.toLowerCase() || '';
      const title = movie.title?.toLowerCase() || '';
      
      // Simple text analysis for different moods
      switch(moodFilter) {
        case 'happy':
          // Include if it seems like a happy movie
          return overview.includes('comedy') || 
                 overview.includes('fun') || 
                 overview.includes('humor') ||
                 title.includes('happy') ||
                 title.includes('fun');
        case 'dark':
          // Include if it seems like a dark movie
          return overview.includes('murder') || 
                 overview.includes('thriller') || 
                 overview.includes('suspense') ||
                 title.includes('dark') ||
                 title.includes('night');
        case 'action':
          // Include if it seems like an action movie
          return overview.includes('action') || 
                 overview.includes('fight') || 
                 overview.includes('battle') ||
                 title.includes('war') ||
                 title.includes('fight');
        case 'thoughtful':
          // Include if it seems like a thoughtful movie
          return overview.includes('life') || 
                 overview.includes('journey') || 
                 overview.includes('discover') ||
                 title.includes('life') ||
                 title.includes('journey');
        case 'emotional':
          // Include if it seems like an emotional movie
          return overview.includes('love') || 
                 overview.includes('relationship') || 
                 overview.includes('heart') ||
                 title.includes('love') ||
                 title.includes('heart');
        default:
          return true;
      }
    });
  }, [suggestions, moodFilter]);

  const handleSelect = (movieTitle: string) => {
    onSearch(movieTitle);
    setSearchTerm('');
  };

  const getMoviePosterUrl = (posterPath: string | null) => {
    return posterPath
      ? `https://image.tmdb.org/t/p/w92${posterPath}`
      : '/placeholder.svg';
  };

  // Function to format release year
  const formatReleaseYear = (releaseDate: string) => {
    return releaseDate ? ` (${new Date(releaseDate).getFullYear()})` : '';
  };

  // Check if a movie is part of a franchise
  const isFranchiseMovie = (movie: any) => {
    return movie.source === 'franchise';
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <Command className="rounded-lg border shadow-md bg-[#1E1E1E]">
        <div className="flex items-center border-b px-3 border-[#333333]">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder={placeholder}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 text-[#F5F5F5]"
          />
        </div>
        <CommandList className="max-h-[300px] overflow-y-auto p-1">
          <CommandEmpty className="py-6 text-center text-sm text-[#666666]">
            {isLoading ? "Searching..." : isError ? "Error connecting to database. Try a different search." : "No movies found."}
          </CommandEmpty>
          {searchTerm.length >= 2 && filteredSuggestions && filteredSuggestions.length > 0 && (
            <CommandGroup>
              {filteredSuggestions.map((movie) => (
                <CommandItem
                  key={movie.id}
                  value={`${movie.title}${formatReleaseYear(movie.release_date)}`}
                  onSelect={() => handleSelect(movie.title)}
                  className="flex items-center gap-3 px-2 py-3 cursor-pointer hover:bg-[#333333] text-[#F5F5F5]"
                >
                  <img
                    src={getMoviePosterUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{movie.title}</span>
                      {isFranchiseMovie(movie) && (
                        <span className="text-xs px-2 py-0.5 bg-amber-500 text-black rounded-full">Series</span>
                      )}
                      {moodFilter && (
                        <span className="text-xs px-2 py-0.5 bg-purple-500 text-white rounded-full">{moodFilter}</span>
                      )}
                    </div>
                    <div className="flex flex-col text-xs text-[#666666]">
                      {movie.release_date && (
                        <span>{formatReleaseYear(movie.release_date)}</span>
                      )}
                      {movie.director && (
                        <span>Director: {movie.director}</span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  );
};
