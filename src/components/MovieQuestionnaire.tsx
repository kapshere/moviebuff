
import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getSimilarMovies } from '@/services/movieService';
import { Movie } from '@/types/movie.types';

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {recommendedMovie ? 'Your Perfect Movie Match' : 'Movie Finder'}
            </DialogTitle>
            <DialogDescription>
              {recommendedMovie ? 'Based on your preferences, we recommend:' : 'Help us find the perfect movie for you'}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B5CF6]"></div>
            </div>
          ) : recommendedMovie ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <h3 className="text-xl font-bold">{recommendedMovie.title}</h3>
                {recommendedMovie.poster_path && (
                  <img 
                    src={`https://image.tmdb.org/t/p/w300${recommendedMovie.poster_path}`}
                    alt={recommendedMovie.title}
                    className="rounded-lg shadow-lg w-48"
                  />
                )}
                <p className="text-sm text-gray-500 text-center mt-2">
                  {recommendedMovie.overview}
                </p>
              </div>
              <div className="flex justify-center pt-4">
                <Button onClick={resetQuestionnaire}>
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium leading-none">
                  {questions[currentQuestion].question}
                </h3>
                <RadioGroup
                  onValueChange={handleAnswer}
                  className="gap-3"
                >
                  {questions[currentQuestion].options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer">
                        <div>
                          <div>{option.label}</div>
                          {option.description && (
                            <div className="text-sm text-gray-500">{option.description}</div>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
