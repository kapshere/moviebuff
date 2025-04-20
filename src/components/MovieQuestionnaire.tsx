
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
  }[];
};

const questions: Question[] = [
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
      // Use a default movie ID for recommendation
      const movieId = 299534; // Example: Avengers: Endgame
      
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
