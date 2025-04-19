
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

interface MovieSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const MovieSearchBar = ({ onSearch, placeholder = "Search movies..." }: MovieSearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['movieSuggestions', searchTerm],
    queryFn: () => searchMovies(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

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
            {isLoading ? "Searching..." : "No movies found."}
          </CommandEmpty>
          {searchTerm.length >= 2 && suggestions && suggestions.length > 0 && (
            <CommandGroup>
              {suggestions.map((movie) => (
                <CommandItem
                  key={movie.id}
                  value={`${movie.title}${formatReleaseYear(movie.release_date)}`}
                  onSelect={handleSelect}
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
                    <span className="font-medium">{movie.title}</span>
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
