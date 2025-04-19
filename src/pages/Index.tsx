
import React, { useState } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { OnboardingTip } from '@/components/OnboardingTip';
import { GenreGrid } from '@/components/GenreGrid';
import { MovieSearch } from '@/components/MovieSearch';

const Index = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGenres, setShowGenres] = useState(false);
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setShowOnboarding(true);
  };

  const handleOnboardingDismiss = () => {
    setShowOnboarding(false);
    setShowGenres(true);
  };

  const handleGenreSelect = (genre: string) => {
    console.log('Selected genre:', genre);
    setSelectedGenre(genre);
    setShowGenres(false);
    setShowMovieSearch(true);
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      {showOnboarding && <OnboardingTip onDismiss={handleOnboardingDismiss} />}
      {showGenres && <GenreGrid onGenreSelect={handleGenreSelect} />}
      {showMovieSearch && <MovieSearch selectedGenre={selectedGenre} />}
    </div>
  );
};

export default Index;
