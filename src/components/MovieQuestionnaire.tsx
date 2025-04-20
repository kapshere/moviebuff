
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Movie } from '@/types/movie.types';
import { toast } from 'sonner';
import { getSimilarMovies } from '@/services/movieService';

type Question = {
  id: string;
  question: string;
  options: {
    label: string;
    value: string;
    description?: string;
    icon?: string;
    movieId?: number; // Added movieId to associate options with seed movies
  }[];
};

const questions: Question[] = [
  {
    id: 'mood',
    question: 'What mood are you in right now?',
    options: [
      { label: 'Happy & Uplifting', value: 'happy', description: 'Comedies, feel-good movies, heartwarming stories', icon: '😊', movieId: 13 }, // Forrest Gump
      { label: 'Dark & Intense', value: 'dark', description: 'Thrillers, horror, crime dramas, suspense', icon: '😨', movieId: 680 }, // Pulp Fiction
      { label: 'Thoughtful', value: 'thoughtful', description: 'Drama, documentaries, philosophical stories', icon: '🤔', movieId: 389 }, // 12 Angry Men
      { label: 'Emotional', value: 'emotional', description: 'Tearjerkers, romantic dramas, powerful stories', icon: '😢', movieId: 597 }, // Titanic
      { label: 'Action-packed', value: 'action', description: 'High-energy adventures, superhero movies, excitement', icon: '💥', movieId: 157336 } // Interstellar
    ]
  },
  {
    id: 'pacing',
    question: 'What kind of pacing do you prefer?',
    options: [
      { label: 'Fast & Dynamic', value: 'fast', description: 'Quick scenes, constant movement, no downtime', icon: '⚡', movieId: 27205 }, // Inception
      { label: 'Steady & Balanced', value: 'balanced', description: 'Even rhythm, mix of action and dialogue', icon: '⚖️', movieId: 155 }, // The Dark Knight
      { label: 'Slow & Contemplative', value: 'slow', description: 'Deliberate pacing, atmospheric, reflective', icon: '🐢', movieId: 335984 } // Blade Runner 2049
    ]
  },
  {
    id: 'era',
    question: 'Do you have a preferred time period?',
    options: [
      { label: 'Latest Releases (2020+)', value: 'new', description: 'The newest movies available', icon: '🆕', movieId: 634649 }, // Spider-Man: No Way Home
      { label: 'Modern Classics (2000-2020)', value: 'modern', description: 'Well-established hits from recent decades', icon: '📱', movieId: 120 }, // The Lord of the Rings
      { label: 'Timeless Classics (Pre-2000)', value: 'classic', description: 'Older movies that stand the test of time', icon: '🏛️', movieId: 278 }, // The Shawshank Redemption
      { label: 'No Preference', value: 'any', description: 'I don\'t mind when it was released', icon: '🤷', movieId: 238 } // The Godfather
    ]
  },
  {
    id: 'complexity',
    question: 'How complex should the story be?',
    options: [
      { label: 'Simple & Straightforward', value: 'simple', description: 'Easy to follow, clear storylines', icon: '📄', movieId: 10681 }, // WALL·E
      { label: 'Balanced', value: 'balanced', description: 'Some depth but not overly complicated', icon: '📚', movieId: 550 }, // Fight Club
      { label: 'Complex & Layered', value: 'complex', description: 'Multi-layered narratives, challenging themes', icon: '🧩', movieId: 13 } // Forrest Gump
    ]
  },
  // New question: Genre preference
  {
    id: 'genre',
    question: 'What genre are you in the mood for?',
    options: [
      { label: 'Science Fiction', value: 'scifi', description: 'Space, technology, future worlds', icon: '🚀', movieId: 157336 }, // Interstellar
      { label: 'Fantasy', value: 'fantasy', description: 'Magic, mythical creatures, imaginary worlds', icon: '🧙', movieId: 120 }, // The Lord of the Rings
      { label: 'Drama', value: 'drama', description: 'Realistic characters facing life challenges', icon: '🎭', movieId: 278 }, // The Shawshank Redemption
      { label: 'Comedy', value: 'comedy', description: 'Humor, light-hearted entertainment', icon: '😂', movieId: 109445 }, // Frozen
      { label: 'Romance', value: 'romance', description: 'Love stories, relationships', icon: '❤️', movieId: 597 } // Titanic
    ]
  },
  // New question: Tone preference
  {
    id: 'tone',
    question: 'What tone do you prefer?',
    options: [
      { label: 'Light & Funny', value: 'light', description: 'Humorous, entertaining, upbeat', icon: '🤣', movieId: 109445 }, // Frozen
      { label: 'Serious & Dramatic', value: 'serious', description: 'Heavy themes, emotional impact', icon: '😐', movieId: 680 }, // Pulp Fiction
      { label: 'Exciting & Tense', value: 'exciting', description: 'Thrilling moments, suspense, action', icon: '😲', movieId: 155 }, // The Dark Knight
      { label: 'Inspiring & Uplifting', value: 'inspiring', description: 'Motivational stories, positive messages', icon: '✨', movieId: 272 } // Batman Begins
    ]
  },
  // New question: Content rating preference
  {
    id: 'rating',
    question: 'What content rating are you comfortable with?',
    options: [
      { label: 'Family-Friendly', value: 'family', description: 'Suitable for all ages, no mature content', icon: '👪', movieId: 10681 }, // WALL·E
      { label: 'Teen-Appropriate', value: 'teen', description: 'Some mature themes but not explicit', icon: '👦', movieId: 157336 }, // Interstellar
      { label: 'Mature Content', value: 'mature', description: 'Adult themes, may include violence or language', icon: '🔞', movieId: 550 }, // Fight Club
      { label: 'Any Rating', value: 'any', description: 'I don\'t mind the content rating', icon: '🎬', movieId: 238 } // The Godfather
    ]
  }
];

export function MovieQuestionnaire() {
  const [open, setOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommendedMovie, setRecommendedMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);

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
      // Instead of using a hardcoded movie ID, determine a seed movie based on answers
      let seedMovieId = determineSeedMovie(answers);
      
      const recommendations = await getSimilarMovies(seedMovieId, {
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

  // Helper function to determine the best seed movie based on answers
  const determineSeedMovie = (answers: Record<string, string>): number => {
    // Create a map of movie IDs and their match count
    const movieMatches: Record<number, number> = {};
    
    // Count matches for each question's selected option
    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        const selectedOption = question.options.find(opt => opt.value === answerValue);
        if (selectedOption && selectedOption.movieId) {
          movieMatches[selectedOption.movieId] = (movieMatches[selectedOption.movieId] || 0) + 1;
        }
      }
    });
    
    // Find the movie ID with the most matches
    let bestMovieId = 278; // Default to Shawshank Redemption if no matches
    let highestMatchCount = 0;
    
    Object.entries(movieMatches).forEach(([movieId, count]) => {
      if (count > highestMatchCount) {
        highestMatchCount = count;
        bestMovieId = Number(movieId);
      }
    });
    
    return bestMovieId;
  };

  const resetQuestionnaire = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setRecommendedMovie(null);
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
      >
        Perfect Match
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
