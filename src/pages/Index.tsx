
import React, { useState } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { OnboardingTip } from '@/components/OnboardingTip';
import { GenreGrid } from '@/components/GenreGrid';
import { MovieSearch } from '@/components/MovieSearch';
import { toast } from 'sonner';
import { MovieSearchBar } from '@/components/MovieSearchBar';
import { MovieQuestionnaire } from '@/components/MovieQuestionnaire';

const Index = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGenres, setShowGenres] = useState(false);
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [directSearchQuery, setDirectSearchQuery] = useState('');
  const [showMultiSearch, setShowMultiSearch] = useState(false);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setShowOnboarding(true);
  };

  const handleOnboardingDismiss = () => {
    setShowOnboarding(false);
    setShowGenres(true);
  };

  const handleGenreSelect = (genre: string) => {
    if (!genre) return; // Add safeguard
    
    setSelectedGenre(genre);
    setDirectSearchQuery('');
    setShowGenres(false);
    setShowMovieSearch(true);
    toast.success(`Looking for ${genre} movies! 🎬`);
  };

  const handleDirectSearch = (query: string) => {
    if (!query || query.trim() === '') return; // Add safeguard
    
    setSelectedGenre('Search');
    setDirectSearchQuery(query.trim());
    setShowGenres(false);
    setShowMovieSearch(true);
    toast.success(`Searching for movies like "${query.trim()}" 🔍`);
  };

  const handleBackToGenres = () => {
    setShowGenres(true);
    setShowMovieSearch(false);
  };

  const handleGenreSearch = (query: string) => {
    if (!query || query.trim() === '') return; // Add safeguard
    
    if (selectedGenre === 'Search') {
      handleDirectSearch(query);
    } else {
      setDirectSearchQuery(query.trim());
      toast.success(`Searching for ${query.trim()} in ${selectedGenre} movies 🔍`);
    }
  };

  const handleMultiSearchToggle = () => {
    setShowMultiSearch(!showMultiSearch);
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="absolute top-4 right-4 z-10">
        <MovieQuestionnaire />
      </div>
      
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      {showOnboarding && <OnboardingTip onDismiss={handleOnboardingDismiss} />}
      
      {showGenres && (
        <GenreGrid 
          onGenreSelect={handleGenreSelect} 
          onDirectSearch={handleDirectSearch}
        />
      )}
      {showMovieSearch && (
        <>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={handleBackToGenres}
                className="text-[#8B5CF6] hover:text-[#7C3AED] flex items-center gap-1"
              >
                ← Back to Genres
              </button>
              <h2 className="text-2xl font-bold text-[#F5F5F5]">
                {selectedGenre === 'Search' 
                  ? `Movies like "${directSearchQuery}"` 
                  : `${selectedGenre} Movies`}
              </h2>
              <div className="w-20" />
            </div>
            
            <MovieSearchBar 
              onSearch={handleGenreSearch} 
              initialValue={directSearchQuery} 
              placeholder={selectedGenre === 'Search' 
                ? "Search for similar movies..." 
                : `Search in ${selectedGenre} movies...`} 
              genre={selectedGenre}
            />
          </div>
          
          <MovieSearch 
            selectedGenre={selectedGenre} 
            directSearchQuery={directSearchQuery}
          />
        </>
      )}
    </div>
  );
};

export default Index;
