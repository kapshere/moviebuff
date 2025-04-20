
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { searchMovies } from '@/services/searchService';
import { getHybridRecommendations } from '@/services/recommendationService';
import { Movie } from '@/types/movie.types';
import { Button } from '@/components/ui/button';

export function MultiMovieSearch({ onClose }: { onClose: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [showResults, setShowResults] = useState(false);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['movieSearch', searchQuery],
    queryFn: () => searchMovies(searchQuery),
    enabled: searchQuery.length > 2,
  });

  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery({
    queryKey: ['hybridRecommendations', selectedMovies.map(m => m.id)],
    queryFn: () => getHybridRecommendations(selectedMovies.map(m => m.id)),
    enabled: selectedMovies.length > 0,
  });

  const handleMovieSelect = (movie: Movie) => {
    if (selectedMovies.length >= 5) {
      toast.error("You can select up to 5 movies");
      return;
    }
    if (!selectedMovies.find(m => m.id === movie.id)) {
      setSelectedMovies([...selectedMovies, movie]);
      toast.success(`Added ${movie.title} to selection`);
    }
  };

  const handleRemoveMovie = (movieId: number) => {
    setSelectedMovies(selectedMovies.filter(m => m.id !== movieId));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Find Similar Movies</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Selected Movies ({selectedMovies.length}/5)</h3>
            <div className="flex flex-wrap gap-2">
              {selectedMovies.map(movie => (
                <div 
                  key={movie.id}
                  className="flex items-center gap-2 bg-secondary p-2 rounded-md"
                >
                  <span className="text-sm">{movie.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMovie(movie.id)}
                    className="h-auto p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Command className="rounded-lg border shadow-md">
            <CommandInput
              placeholder="Search for movies..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              onFocus={() => setShowResults(true)}
            />
            {showResults && (
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {searchResults && (
                  <CommandGroup>
                    {searchResults.map((movie) => (
                      <CommandItem
                        key={movie.id}
                        onSelect={() => {
                          handleMovieSelect(movie);
                          setSearchQuery('');
                          setShowResults(false);
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {movie.poster_path && (
                          <img
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                            alt={movie.title}
                            className="w-8 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{movie.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(movie.release_date).getFullYear()}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            )}
          </Command>

          {selectedMovies.length > 0 && recommendations && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recommended Movies</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {recommendations.slice(0, 6).map((movie) => (
                  <div key={movie.id} className="space-y-2">
                    {movie.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full rounded-lg shadow-lg"
                      />
                    )}
                    <div className="text-sm font-medium">{movie.title}</div>
                    {movie.matchReason && (
                      <div className="text-xs text-muted-foreground">
                        {movie.matchReason[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoadingRecommendations && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
