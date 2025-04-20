
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Movie } from '@/types/movie.types';
import { toast } from 'sonner';
import { X } from 'lucide-react';
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
  }[];
};

const questions: Question[] = [
  {
    id: 'mood',
    question: 'What mood are you in right now?',
    options: [
      { label: 'Happy & Uplifting', value: 'happy', description: 'Looking for something light and joyful' },
      { label: 'Dark & Intense', value: 'dark', description: 'In the mood for something serious or thrilling' },
      { label: 'Thoughtful', value: 'thoughtful', description: 'Want something that makes me think' },
      { label: 'Emotional', value: 'emotional', description: 'Ready for an emotional journey' },
      { label: 'Action-packed', value: 'action', description: 'Want excitement and adventure' }
    ]
  },
  {
    id: 'pacing',
    question: 'What kind of pacing do you prefer?',
    options: [
      { label: 'Fast & Dynamic', value: 'fast' },
      { label: 'Steady & Balanced', value: 'balanced' },
      { label: 'Slow & Contemplative', value: 'slow' }
    ]
  },
  {
    id: 'era',
    question: 'Do you have a preferred time period?',
    options: [
      { label: 'Latest Releases', value: 'new' },
      { label: 'Modern Classics (2000-2020)', value: 'modern' },
      { label: 'Timeless Classics', value: 'classic' },
      { label: 'No Preference', value: 'any' }
    ]
  },
  {
    id: 'complexity',
    question: 'How complex should the story be?',
    options: [
      { label: 'Simple & Straightforward', value: 'simple' },
      { label: 'Balanced', value: 'balanced' },
      { label: 'Complex & Layered', value: 'complex' }
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
  const [mode, setMode] = useState<'questionnaire' | 'similar'>('questionnaire');

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['movieSearch', searchQuery],
    queryFn: () => searchMovies(searchQuery),
    enabled: searchQuery.length > 2,
  });

  const handleAnswer = (value: string) => {
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

  const getRecommendation = async () => {
    setLoading(true);
    try {
      // Use the advanced recommendation system with user preferences
      const recommendations = await getSimilarMovies(299534, { // Using Endgame as base movie
        moodFilter: answers.mood as 'happy' | 'dark' | 'action' | 'thoughtful' | 'emotional',
        preferNewReleases: answers.era === 'new',
        weightDirector: answers.complexity === 'complex' ? 1.2 : 0.8,
        weightGenre: 1.1,
        weightCast: answers.complexity === 'simple' ? 0.7 : 1,
      });

      if (recommendations.length > 0) {
        setRecommendedMovie(recommendations[0]);
        toast.success("Found the perfect movie for you! 🎬");
      } else {
        toast.error("Couldn't find a matching movie. Try different preferences!");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
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

  const resetQuestionnaire = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setRecommendedMovie(null);
    setSelectedMovies([]);
    setMode('questionnaire');
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
            {!recommendedMovie && (
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setMode('questionnaire')}
                  variant={mode === 'questionnaire' ? 'default' : 'outline'}
                  className={mode === 'questionnaire' ? 'bg-[#8B5CF6]' : 'text-white'}
                >
                  Preferences
                </Button>
                <Button
                  onClick={() => setMode('similar')}
                  variant={mode === 'similar' ? 'default' : 'outline'}
                  className={mode === 'similar' ? 'bg-[#8B5CF6]' : 'text-white'}
                >
                  Similar Movies
                </Button>
              </div>
            )}

            {mode === 'questionnaire' && !recommendedMovie && (
              <div className="space-y-2">
                <h3 className="font-medium leading-none text-white">
                  {questions[currentQuestion].question}
                </h3>
                <RadioGroup
                  onValueChange={handleAnswer}
                  className="gap-3"
                >
                  {questions[currentQuestion].options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer text-gray-200">
                        <div>
                          <div>{option.label}</div>
                          {option.description && (
                            <div className="text-sm text-gray-400">{option.description}</div>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {mode === 'similar' && !recommendedMovie && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-white">Selected Movies ({selectedMovies.length}/5)</h3>
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

                <Command className="rounded-lg border border-[#2A2A2A] bg-[#121212]">
                  <CommandInput
                    placeholder="Search for movies..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    onFocus={() => setShowResults(true)}
                    className="text-white"
                  />
                  {showResults && (
                    <CommandList>
                      <CommandEmpty className="text-gray-400">No results found.</CommandEmpty>
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
                              className="flex items-center gap-2 cursor-pointer hover:bg-[#2A2A2A]"
                            >
                              {movie.poster_path && (
                                <img
                                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                  alt={movie.title}
                                  className="w-8 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <div className="font-medium text-white">{movie.title}</div>
                                <div className="text-sm text-gray-400">
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
                  <p className="text-sm text-gray-400 text-center mt-2">
                    {recommendedMovie.overview}
                  </p>
                </div>
                <div className="flex justify-center pt-4">
                  <Button onClick={resetQuestionnaire} className="bg-[#8B5CF6] hover:bg-[#7C3AED]">
                    Try Again
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

