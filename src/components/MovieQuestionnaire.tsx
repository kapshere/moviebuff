
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Movie } from '@/types/movie.types';
import { toast } from 'sonner';
import { X, Search, Film } from 'lucide-react';
import { searchMovies } from '@/services/searchService';
import { getSimilarMovies } from '@/services/movieService';
import { useQuery } from '@tanstack/react-query';

type Question = {
  id: string;
  question: string;
  options: {
    label: string;
    value: string;
    description?: string;
    icon?: string;
  }[];
};

const questions: Question[] = [
  {
    id: 'similarMovies',
    question: 'Would you like to select some movies you enjoy? (Optional)',
    options: [
      { label: 'Yes, find movies similar to my favorites', value: 'yes', description: 'Select up to 5 movies you love', icon: '🎬' },
      { label: 'Skip this step', value: 'skip', description: 'I\'ll just answer some questions instead', icon: '⏭️' }
    ]
  },
  {
    id: 'mood',
    question: 'What mood are you in right now?',
    options: [
      { label: 'Happy & Uplifting', value: 'happy', description: 'Comedies, feel-good movies, heartwarming stories', icon: '😊' },
      { label: 'Dark & Intense', value: 'dark', description: 'Thrillers, horror, crime dramas, suspense', icon: '😨' },
      { label: 'Thoughtful', value: 'thoughtful', description: 'Drama, documentaries, philosophical stories', icon: '🤔' },
      { label: 'Emotional', value: 'emotional', description: 'Tearjerkers, romantic dramas, powerful stories', icon: '😢' },
      { label: 'Action-packed', value: 'action', description: 'High-energy adventures, superhero movies, excitement', icon: '💥' }
    ]
  },
  {
    id: 'pacing',
    question: 'What kind of pacing do you prefer?',
    options: [
      { label: 'Fast & Dynamic', value: 'fast', description: 'Quick scenes, constant movement, no downtime', icon: '⚡' },
      { label: 'Steady & Balanced', value: 'balanced', description: 'Even rhythm, mix of action and dialogue', icon: '⚖️' },
      { label: 'Slow & Contemplative', value: 'slow', description: 'Deliberate pacing, atmospheric, reflective', icon: '🐢' }
    ]
  },
  {
    id: 'era',
    question: 'Do you have a preferred time period?',
    options: [
      { label: 'Latest Releases (2020+)', value: 'new', description: 'The newest movies available', icon: '🆕' },
      { label: 'Modern Classics (2000-2020)', value: 'modern', description: 'Well-established hits from recent decades', icon: '📱' },
      { label: 'Timeless Classics (Pre-2000)', value: 'classic', description: 'Older movies that stand the test of time', icon: '🏛️' },
      { label: 'No Preference', value: 'any', description: 'I don\'t mind when it was released', icon: '🤷' }
    ]
  },
  {
    id: 'complexity',
    question: 'How complex should the story be?',
    options: [
      { label: 'Simple & Straightforward', value: 'simple', description: 'Easy to follow, clear storylines', icon: '📄' },
      { label: 'Balanced', value: 'balanced', description: 'Some depth but not overly complicated', icon: '📚' },
      { label: 'Complex & Layered', value: 'complex', description: 'Multi-layered narratives, challenging themes', icon: '🧩' }
    ]
  }
];

export function MovieQuestionnaire() {
  const [open, setOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommendedMovie, setRecommendedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [commandKey, setCommandKey] = useState<number>(0); // Add a key to force re-render

  // Force re-render when showing/hiding results to avoid stale cmdk state
  useEffect(() => {
    setCommandKey(prev => prev + 1);
  }, [showResults, showMovieSearch]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['movieSearch', searchQuery],
    queryFn: async () => {
      try {
        if (searchQuery.trim().length <= 2) return [];
        const results = await searchMovies(searchQuery);
        return Array.isArray(results) ? results : [];
      } catch (error) {
        console.error('Search error:', error);
        return [];
      }
    },
    enabled: searchQuery.trim().length > 2,
  });

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        resetQuestionnaire();
      }, 300);
    }
  }, [open]);

  const handleAnswer = (value: string) => {
    if (currentQuestion === 0 && value === 'yes') {
      setShowMovieSearch(true);
      setAnswers(prev => ({
        ...prev,
        [questions[currentQuestion].id]: value
      }));
      return;
    }

    if (currentQuestion === 0 && value === 'skip') {
      setShowMovieSearch(false);
      setCurrentQuestion(prev => prev + 1);
      setAnswers(prev => ({
        ...prev,
        [questions[currentQuestion].id]: value
      }));
      return;
    }

    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      getRecommendation();
    }
  };

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

  const handleContinue = () => {
    setShowMovieSearch(false);
    setCurrentQuestion(prev => prev + 1);
  };

  const getRecommendation = async () => {
    setLoading(true);
    try {
      // Use selected movies for recommendation if available
      const movieId = selectedMovies.length > 0 ? selectedMovies[0].id : 299534;
      
      const recommendations = await getSimilarMovies(movieId, {
        moodFilter: answers.mood as 'happy' | 'dark' | 'action' | 'thoughtful' | 'emotional',
        preferNewReleases: answers.era === 'new',
        weightDirector: answers.complexity === 'complex' ? 1.2 : 0.8,
        weightGenre: 1.1,
        weightCast: answers.complexity === 'simple' ? 0.7 : 1,
      });

      if (recommendations && Array.isArray(recommendations) && recommendations.length > 0) {
        setRecommendedMovie(recommendations[0]);
        toast.success("Found the perfect movie for you! 🎬");
      } else {
        toast.error("Couldn't find a matching movie. Try different preferences!");
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetQuestionnaire = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setRecommendedMovie(null);
    setSelectedMovies([]);
    setShowMovieSearch(false);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
      >
        Find Perfect Movie
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-[#121212] text-white border-[#2A2A2A]">
          <DialogHeader>
            <DialogTitle className="text-white">
              {recommendedMovie ? 'Your Perfect Movie Match' : 'Movie Finder'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {recommendedMovie ? 'Based on your preferences, we recommend:' : 'Help us find the perfect movie for you'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!recommendedMovie && !showMovieSearch && (
              <div className="space-y-2">
                <h3 className="font-medium leading-none text-white">
                  {questions[currentQuestion].question}
                </h3>
                <RadioGroup
                  onValueChange={handleAnswer}
                  className="gap-3 mt-4"
                >
                  {questions[currentQuestion].options.map((option) => (
                    <div 
                      key={option.value} 
                      className="flex items-center space-x-2 p-3 rounded-lg border border-transparent transition-all duration-200 hover:border-[#8B5CF6] hover:bg-[#1A1A1A] hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] cursor-pointer group"
                    >
                      <RadioGroupItem 
                        value={option.value} 
                        id={option.value} 
                        className="text-[#8B5CF6]"
                      />
                      <Label htmlFor={option.value} className="cursor-pointer flex-grow">
                        <div className="flex items-start">
                          {option.icon && (
                            <span className="mr-2 text-lg">{option.icon}</span>
                          )}
                          <div>
                            <div className="text-gray-200 font-medium group-hover:text-white transition-colors">
                              {option.label}
                            </div>
                            {option.description && (
                              <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {showMovieSearch && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-white">Selected Movies ({selectedMovies.length}/5)</h3>
                  
                  {selectedMovies.length === 0 && (
                    <p className="text-sm text-gray-400">Search and select movies you enjoy below</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedMovies.map(movie => (
                      <div 
                        key={movie.id}
                        className="flex items-center gap-2 bg-[#2A2A2A] p-2 rounded-md"
                      >
                        <span className="text-sm text-white">{movie.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMovie(movie.id)}
                          className="h-auto p-0 hover:bg-transparent"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    {/* Using key to force re-render when needed */}
                    <Command key={commandKey} className="rounded-lg border border-[#2A2A2A] bg-[#121212]">
                      <div className="flex items-center border-b border-[#2A2A2A] px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                        <CommandInput
                          placeholder="Search for movies..."
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                          onFocus={() => setShowResults(true)}
                          className="text-white flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                        />
                        {searchQuery && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchQuery('')}
                            className="h-auto p-1 hover:bg-transparent"
                          >
                            <X className="h-4 w-4 text-gray-400" />
                          </Button>
                        )}
                      </div>
                      
                      {searchQuery.trim().length > 2 && showResults && (
                        <CommandList className="max-h-[200px] overflow-y-auto p-1">
                          {isLoading && (
                            <div className="py-6 text-center text-sm text-gray-400">
                              Searching movies...
                            </div>
                          )}
                          
                          <CommandEmpty className="py-6 text-center text-sm text-gray-400">
                            No results found
                          </CommandEmpty>
                          
                          {Array.isArray(searchResults) && searchResults.length > 0 ? (
                            <CommandGroup>
                              {searchResults.map((movie) => (
                                <CommandItem
                                  key={movie.id}
                                  onSelect={() => {
                                    handleMovieSelect(movie);
                                    setSearchQuery('');
                                  }}
                                  className="flex items-center gap-2 cursor-pointer hover:bg-[#2A2A2A] py-2"
                                >
                                  {movie.poster_path ? (
                                    <img
                                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                      alt={movie.title}
                                      className="w-8 h-12 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-8 h-12 bg-[#2A2A2A] rounded flex items-center justify-center">
                                      <Film className="h-4 w-4 text-gray-400" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium text-white">{movie.title}</div>
                                    <div className="text-xs text-gray-400">
                                      {movie.release_date ? new Date(movie.release_date).getFullYear() : ''}
                                      {movie.director && ` • Dir: ${movie.director}`}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ) : null}
                        </CommandList>
                      )}
                    </Command>
                  </div>
                  
                  <p className="text-xs text-gray-400 px-1">
                    Type at least 3 characters to search
                  </p>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMovieSearch(false);
                      handleAnswer('skip');
                    }}
                    className="border-[#2A2A2A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white"
                  >
                    Skip
                  </Button>
                  
                  <Button
                    onClick={handleContinue}
                    className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                    disabled={selectedMovies.length === 0}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
              </div>
            )}

            {recommendedMovie && (
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <h3 className="text-xl font-bold text-white">{recommendedMovie.title}</h3>
                  {recommendedMovie.poster_path && (
                    <img 
                      src={`https://image.tmdb.org/t/p/w300${recommendedMovie.poster_path}`}
                      alt={recommendedMovie.title}
                      className="rounded-lg shadow-lg w-48"
                    />
                  )}
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    {recommendedMovie.release_date && (
                      <span>{new Date(recommendedMovie.release_date).getFullYear()}</span>
                    )}
                    {recommendedMovie.vote_average > 0 && (
                      <>
                        <span>•</span>
                        <span>⭐ {recommendedMovie.vote_average.toFixed(1)}/10</span>
                      </>
                    )}
                    {recommendedMovie.director && (
                      <>
                        <span>•</span>
                        <span>Dir: {recommendedMovie.director}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 text-center mt-2 max-h-32 overflow-y-auto">
                    {recommendedMovie.overview}
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-4">
                  <Button 
                    onClick={resetQuestionnaire} 
                    variant="outline"
                    className="border-[#2A2A2A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => setOpen(false)}
                    className="bg-[#8B5CF6] hover:bg-[#7C3AED]"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
