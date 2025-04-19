
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
              {suggestions.slice(0, 8).map((movie) => (
                <CommandItem
                  key={movie.id}
                  value={movie.title}
                  onSelect={handleSelect}
                  className="flex items-center px-2 py-3 cursor-pointer hover:bg-[#333333] text-[#F5F5F5]"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{movie.title}</span>
                    {movie.release_date && (
                      <span className="text-xs text-[#666666]">
                        {new Date(movie.release_date).getFullYear()}
                      </span>
                    )}
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
