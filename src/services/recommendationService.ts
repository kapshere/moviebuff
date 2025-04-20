import { Movie } from '@/types/movie.types';
import { BASE_URL, API_KEY } from '@/config/api.config';
import { getFallbackMovies } from './fallbackService';

// Advanced content-based recommendation system
export const getSimilarMovies = async (movieId: number, userPreferences?: {
  preferNewReleases?: boolean,
  preferSameLanguage?: boolean,
  moodFilter?: 'happy' | 'dark' | 'action' | 'thoughtful' | 'emotional',
  weightDirector?: number,
  weightGenre?: number,
  weightCast?: number,
}): Promise<Movie[]> => {
  try {
    // First, get comprehensive details about the target movie
    const movieResponse = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=keywords,credits,similar,recommendations,videos,images,release_dates,translations`
    );
    
    if (!movieResponse.ok) {
      console.error('Failed to fetch movie details for recommendation:', movieResponse.status);
      return [];
    }
    
    const movieData = await movieResponse.json();
    const recommendations: Record<number, Movie & { similarityScore?: number; matchReason?: string[] }> = {};
    
    // Setup personalized weighting
    const weights = {
      director: userPreferences?.weightDirector || 0.8,    // Reduced from 1.2
      genre: userPreferences?.weightGenre || 0.6,         // Reduced from 1.1
      cast: userPreferences?.weightCast || 0.7,          // Reduced from 1.3
      era: userPreferences?.preferNewReleases ? 0.5 : 0.3,
      language: userPreferences?.preferSameLanguage ? 0.5 : 0.3,
      combinedBonus: 0.4  // Reduced from 1.25 to make multiple matches less dominant
    };
    
    // Step 1: Collection/Franchise Analysis - Same universe movies get highest priority
    if (movieData.belongs_to_collection) {
      try {
        const collectionResponse = await fetch(
          `${BASE_URL}/collection/${movieData.belongs_to_collection.id}?api_key=${API_KEY}&language=en-US`
        );
        
        if (collectionResponse.ok) {
          const collectionData = await collectionResponse.json();
          
          for (const movie of collectionData.parts) {
            if (movie.id !== movieId) {
              recommendations[movie.id] = {
                id: movie.id,
                title: movie.title,
                release_date: movie.release_date,
                poster_path: movie.poster_path,
                vote_average: movie.vote_average,
                overview: movie.overview,
                popularity: movie.popularity || 0,
                vote_count: movie.vote_count || 0,
                similarityScore: 85, // Reduced from 100
                matchReason: ['Same Film Series'],
                source: 'franchise'
              };
            }
          }
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
      }
    }
    
    // Enhanced Director Analysis with more detailed matching
    const directors = movieData.credits?.crew?.filter((person: any) => person.job === 'Director') || [];
    
    if (directors.length > 0) {
      try {
        const directorResponse = await fetch(
          `${BASE_URL}/person/${directors[0].id}/movie_credits?api_key=${API_KEY}&language=en-US`
        );
        
        if (directorResponse.ok) {
          const directorData = await directorResponse.json();
          const directedMovies = directorData.crew.filter((credit: any) => 
            credit.job === 'Director' && credit.id !== movieId
          );
          
          for (const movie of directedMovies) {
            if (recommendations[movie.id]) {
              if (!recommendations[movie.id].matchReason?.includes('Same Director')) {
                recommendations[movie.id].matchReason?.push('Same Director');
                recommendations[movie.id].similarityScore = 
                  (recommendations[movie.id].similarityScore || 0) + (20 * weights.director * weights.combinedBonus);
              }
            } else {
              recommendations[movie.id] = {
                id: movie.id,
                title: movie.title,
                release_date: movie.release_date,
                poster_path: movie.poster_path,
                vote_average: movie.vote_average,
                overview: movie.overview,
                popularity: movie.popularity || 0,
                vote_count: movie.vote_count || 0,
                similarityScore: 65 * weights.director,
                matchReason: ['Same Director'],
                director: directors[0].name,
                director_id: directors[0].id,
                source: 'director'
              };
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching movies for director ${directors[0].name}:`, error);
      }
    }
    
    // Enhanced Cast Analysis with lead actor focus
    const mainCast = movieData.credits?.cast?.slice(0, 5) || []; // Increased from 4 to 5
    
    if (mainCast.length > 0) {
      for (const actor of mainCast) {
        try {
          const actorResponse = await fetch(
            `${BASE_URL}/person/${actor.id}/movie_credits?api_key=${API_KEY}&language=en-US`
          );
          
          if (actorResponse.ok) {
            const actorData = await actorResponse.json();
            const leadRoles = actorData.cast.filter((credit: any) => 
              credit.id !== movieId && credit.order < 5
            ).slice(0, 10); // Increased from 8 to 10
            
            for (const movie of leadRoles) {
              if (recommendations[movie.id]) {
                const matchReason = `Same Actor (${actor.name})`;
                if (!recommendations[movie.id].matchReason?.includes(matchReason)) {
                  recommendations[movie.id].matchReason?.push(matchReason);
                  // Increase score more significantly for multiple actor matches
                  recommendations[movie.id].similarityScore = 
                    (recommendations[movie.id].similarityScore || 0) + (15 * weights.cast * weights.combinedBonus);
                }
              } else {
                recommendations[movie.id] = {
                  id: movie.id,
                  title: movie.title,
                  release_date: movie.release_date,
                  poster_path: movie.poster_path,
                  vote_average: movie.vote_average,
                  overview: movie.overview,
                  popularity: movie.popularity || 0,
                  vote_count: movie.vote_count || 0,
                  similarityScore: 55 * weights.cast,
                  matchReason: [`Same Actor (${actor.name})`],
                  source: 'cast'
                };
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching movies for actor ${actor.name}:`, error);
        }
      }
    }
    
    // Step 4: Keyword Analysis - Movies with similar themes/topics
    const keywords = movieData.keywords?.keywords || [];
    
    if (keywords.length > 0) {
      // Get the top 10 most specific keywords (avoiding generic ones)
      const significantKeywords = keywords
        .filter((k: any) => !['based on novel', 'violence', 'murder'].includes(k.name.toLowerCase()))
        .slice(0, 10);
      
      for (const keyword of significantKeywords) {
        try {
          const keywordResponse = await fetch(
            `${BASE_URL}/keyword/${keyword.id}/movies?api_key=${API_KEY}&language=en-US&include_adult=false`
          );
          
          if (keywordResponse.ok) {
            const keywordData = await keywordResponse.json();
            
            // Get popular movies with this keyword
            const keywordMovies = keywordData.results
              .filter((movie: any) => movie.id !== movieId)
              .sort((a: any, b: any) => b.vote_average - a.vote_average)
              .slice(0, 5);
            
            for (const movie of keywordMovies) {
              if (recommendations[movie.id]) {
                if (!recommendations[movie.id].matchReason?.includes('Similar Themes')) {
                  recommendations[movie.id].matchReason?.push('Similar Themes');
                  recommendations[movie.id].similarityScore = 
                    (recommendations[movie.id].similarityScore || 0) + 8;
                }
              } else {
                recommendations[movie.id] = {
                  id: movie.id,
                  title: movie.title,
                  release_date: movie.release_date,
                  poster_path: movie.poster_path,
                  vote_average: movie.vote_average,
                  overview: movie.overview,
                  popularity: movie.popularity || 0,
                  vote_count: movie.vote_count || 0,
                  similarityScore: 45, // Reduced from 65
                  matchReason: ['Similar Themes'],
                  source: 'keyword'
                };
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching movies for keyword ${keyword.name}:`, error);
        }
      }
    }
    
    // Step 5: Genre Match Analysis - Movies in the same genres
    const genres = movieData.genres || [];
    
    if (genres.length > 0) {
      try {
        // Construct a query with all the genres
        const genreIds = genres.map((g: any) => g.id).join(',');
        const genreResponse = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreIds}&page=1`
        );
        
        if (genreResponse.ok) {
          const genreData = await genreResponse.json();
          
          // Get popular movies with these genres
          const genreMovies = genreData.results
            .filter((movie: any) => movie.id !== movieId)
            .slice(0, 15);
          
          for (const movie of genreMovies) {
            if (recommendations[movie.id]) {
              if (!recommendations[movie.id].matchReason?.includes('Genre Match')) {
                recommendations[movie.id].matchReason?.push('Genre Match');
                recommendations[movie.id].similarityScore = 
                  (recommendations[movie.id].similarityScore || 0) + 5;
              }
            } else {
              recommendations[movie.id] = {
                id: movie.id,
                title: movie.title,
                release_date: movie.release_date,
                poster_path: movie.poster_path,
                vote_average: movie.vote_average,
                overview: movie.overview,
                popularity: movie.popularity || 0,
                vote_count: movie.vote_count || 0,
                similarityScore: 40, // Reduced from 60
                matchReason: ['Genre Match'],
                source: 'genre'
              };
            }
          }
        }
      } catch (error) {
        console.error('Error fetching genre movies:', error);
      }
    }
    
    // Step 6: API Recommendations - Leverage TMDB's built-in recommendation system
    const tmdbRecommendations = movieData.recommendations?.results || [];
    const tmdbSimilar = movieData.similar?.results || [];
    
    // Combine both recommendation sources from TMDB
    const apiSuggestions = [...tmdbRecommendations, ...tmdbSimilar];
    
    for (const movie of apiSuggestions) {
      if (recommendations[movie.id]) {
        if (!recommendations[movie.id].matchReason?.includes('TMDB Recommended')) {
          recommendations[movie.id].matchReason?.push('TMDB Recommended');
          recommendations[movie.id].similarityScore = 
            (recommendations[movie.id].similarityScore || 0) + 10;
        }
      } else {
        recommendations[movie.id] = {
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          overview: movie.overview,
          popularity: movie.popularity || 0,
          vote_count: movie.vote_count || 0,
          similarityScore: 50, // Reduced from 70
          matchReason: ['TMDB Recommended'],
          source: 'recommend'
        };
      }
    }
    
    // Step 7: Era Matching - Movies from the same time period
    const originalReleaseYear = movieData.release_date 
      ? new Date(movieData.release_date).getFullYear() 
      : null;
    
    if (originalReleaseYear) {
      const startYear = originalReleaseYear - 5;
      const endYear = originalReleaseYear + 5;
      
      try {
        const eraResponse = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=100&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31&page=1`
        );
        
        if (eraResponse.ok) {
          const eraData = await eraResponse.json();
          
          // Get critically acclaimed movies from same era
          const eraMovies = eraData.results
            .filter((movie: any) => movie.id !== movieId)
            .slice(0, 10);
          
          for (const movie of eraMovies) {
            if (recommendations[movie.id]) {
              if (!recommendations[movie.id].matchReason?.includes('Same Era')) {
                recommendations[movie.id].matchReason?.push('Same Era');
                recommendations[movie.id].similarityScore = 
                  (recommendations[movie.id].similarityScore || 0) + 3;
              }
            } else {
              recommendations[movie.id] = {
                id: movie.id,
                title: movie.title,
                release_date: movie.release_date,
                poster_path: movie.poster_path,
                vote_average: movie.vote_average,
                overview: movie.overview,
                popularity: movie.popularity || 0,
                vote_count: movie.vote_count || 0,
                similarityScore: 35, // Reduced from 50
                matchReason: ['Same Era'],
                source: 'era'
              };
            }
          }
        }
      } catch (error) {
        console.error('Error fetching era movies:', error);
      }
    }
    
    // NEW - Step 8: Visual Style Analysis - Similar cinematography and visual aesthetics
    try {
      // First, check if the target movie has associated images
      const imagesResponse = await fetch(
        `${BASE_URL}/movie/${movieId}/images?api_key=${API_KEY}`
      );
      
      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        
        // If we have backdrops, we can use them to find visually similar movies
        if (imagesData.backdrops && imagesData.backdrops.length > 0) {
          // TMDB doesn't have a direct visual similarity API, but we can use the "similar" endpoint 
          // which often includes movies with similar visual style
          const visualResponse = await fetch(
            `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=1`
          );
          
          if (visualResponse.ok) {
            const visualData = await visualResponse.json();
            const visualMovies = visualData.results.slice(0, 10);
            
            for (const movie of visualMovies) {
              if (recommendations[movie.id]) {
                if (!recommendations[movie.id].matchReason?.includes('Visual Style')) {
                  recommendations[movie.id].matchReason?.push('Visual Style');
                  recommendations[movie.id].similarityScore = 
                    (recommendations[movie.id].similarityScore || 0) + 12;
                }
              } else {
                recommendations[movie.id] = {
                  id: movie.id,
                  title: movie.title,
                  release_date: movie.release_date,
                  poster_path: movie.poster_path,
                  vote_average: movie.vote_average,
                  overview: movie.overview,
                  popularity: movie.popularity || 0,
                  vote_count: movie.vote_count || 0,
                  similarityScore: 45, // Reduced from 75
                  matchReason: ['Visual Style'],
                  source: 'visual'
                };
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in visual style analysis:', error);
    }
    
    // NEW - Step 9: Language and Region Compatibility
    try {
      const movieLanguage = movieData.original_language || 'en';
      const movieRegion = movieData.production_countries?.[0]?.iso_3166_1 || 'US';
      
      // Find movies from the same region and language
      const regionResponse = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_original_language=${movieLanguage}&region=${movieRegion}&page=1`
      );
      
      if (regionResponse.ok) {
        const regionData = await regionResponse.json();
        const regionMovies = regionData.results
          .filter((movie: any) => movie.id !== movieId)
          .slice(0, 10);
        
        for (const movie of regionMovies) {
          if (recommendations[movie.id]) {
            if (!recommendations[movie.id].matchReason?.includes('Same Region/Language')) {
              recommendations[movie.id].matchReason?.push('Same Region/Language');
              recommendations[movie.id].similarityScore = 
                (recommendations[movie.id].similarityScore || 0) + (10 * weights.language);
            }
          } else {
            recommendations[movie.id] = {
              id: movie.id,
              title: movie.title,
              release_date: movie.release_date,
              poster_path: movie.poster_path,
              vote_average: movie.vote_average,
              overview: movie.overview,
              popularity: movie.popularity || 0,
              vote_count: movie.vote_count || 0,
              similarityScore: 45 * weights.language, // Reduced from 65
              matchReason: ['Same Region/Language'],
              source: 'region'
            };
          }
        }
      }
    } catch (error) {
      console.error('Error in language/region analysis:', error);
    }
    
    // NEW - Step 10: Mood-Based Analysis
    if (userPreferences?.moodFilter) {
      try {
        // Keywords associated with different moods
        const moodKeywords: Record<string, string[]> = {
          'happy': ['comedy', 'feel-good', 'uplifting', 'light-hearted', 'family'],
          'dark': ['thriller', 'horror', 'crime', 'dystopian', 'mystery'],
          'action': ['action', 'adventure', 'superhero', 'explosion', 'fighting'],
          'thoughtful': ['drama', 'philosophical', 'psychological', 'indie', 'thought-provoking'],
          'emotional': ['romance', 'melodrama', 'tear-jerker', 'emotional', 'relationships']
        };
        
        const selectedMoodKeywords = moodKeywords[userPreferences.moodFilter] || [];
        
        // Convert keywords to a comma-separated string for the API
        if (selectedMoodKeywords.length > 0) {
          // We'll use the discover API with keyword filtering
          // First, we need to get keyword IDs
          const keywordPromises = selectedMoodKeywords.map(async (keyword) => {
            try {
              const keywordResponse = await fetch(
                `${BASE_URL}/search/keyword?api_key=${API_KEY}&query=${keyword}&page=1`
              );
              
              if (keywordResponse.ok) {
                const keywordData = await keywordResponse.json();
                return keywordData.results[0]?.id;
              }
              return null;
            } catch (error) {
              console.error(`Error fetching keyword ID for ${keyword}:`, error);
              return null;
            }
          });
          
          const keywordIds = (await Promise.all(keywordPromises)).filter(id => id !== null);
          
          if (keywordIds.length > 0) {
            const moodResponse = await fetch(
              `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_keywords=${keywordIds.join('|')}&page=1`
            );
            
            if (moodResponse.ok) {
              const moodData = await moodResponse.json();
              const moodMovies = moodData.results
                .filter((movie: any) => movie.id !== movieId)
                .slice(0, 15);
              
              for (const movie of moodMovies) {
                if (recommendations[movie.id]) {
                  if (!recommendations[movie.id].matchReason?.includes(`Matches ${userPreferences.moodFilter} Mood`)) {
                    recommendations[movie.id].matchReason?.push(`Matches ${userPreferences.moodFilter} Mood`);
                    recommendations[movie.id].similarityScore = 
                      (recommendations[movie.id].similarityScore || 0) + 20; // Higher boost for mood match
                  }
                } else {
                  recommendations[movie.id] = {
                    id: movie.id,
                    title: movie.title,
                    release_date: movie.release_date,
                    poster_path: movie.poster_path,
                    vote_average: movie.vote_average,
                    overview: movie.overview,
                    popularity: movie.popularity || 0,
                    vote_count: movie.vote_count || 0,
                    similarityScore: 60, // High score for mood match
                    matchReason: [`Matches ${userPreferences.moodFilter} Mood`],
                    source: 'mood'
                  };
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in mood-based analysis:', error);
      }
    }
    
    // NEW - Step 11: Awards and Critical Recognition
    try {
      // Find critically acclaimed movies similar to this one
      // Unfortunately TMDB doesn't have a direct API for awards, but we can use high vote_average as a proxy
      const acclaimedResponse = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=1000&vote_average.gte=7.5&with_genres=${movieData.genres.map((g: any) => g.id).join(',')}&page=1`
      );
      
      if (acclaimedResponse.ok) {
        const acclaimedData = await acclaimedResponse.json();
        const acclaimedMovies = acclaimedData.results
          .filter((movie: any) => movie.id !== movieId)
          .slice(0, 10);
        
        for (const movie of acclaimedMovies) {
          if (recommendations[movie.id]) {
            if (!recommendations[movie.id].matchReason?.includes('Critically Acclaimed')) {
              recommendations[movie.id].matchReason?.push('Critically Acclaimed');
              recommendations[movie.id].similarityScore = 
                (recommendations[movie.id].similarityScore || 0) + 15;
            }
          } else {
            recommendations[movie.id] = {
              id: movie.id,
              title: movie.title,
              release_date: movie.release_date,
              poster_path: movie.poster_path,
              vote_average: movie.vote_average,
              overview: movie.overview,
              popularity: movie.popularity || 0,
              vote_count: movie.vote_count || 0,
              similarityScore: 60, // Good score for acclaimed movies
              matchReason: ['Critically Acclaimed'],
              source: 'acclaimed'
            };
          }
        }
      }
    } catch (error) {
      console.error('Error in awards/critical analysis:', error);
    }
    
    // Enhanced final sorting with multiple factor consideration
    let recommendedMovies = Object.values(recommendations);
    
    // Prioritize movies with multiple matching factors
    recommendedMovies = recommendedMovies.map(movie => {
      const matchCount = movie.matchReason?.length || 0;
      const multiFactorBonus = matchCount > 1 ? (matchCount - 1) * 5 * weights.combinedBonus : 0;
      
      // Cap the maximum similarity score at 95%
      let finalScore = Math.min((movie.similarityScore || 0) + multiFactorBonus, 95);
      
      // Apply a more natural distribution
      finalScore = Math.round((finalScore * 0.8) + (Math.random() * 5));
      
      return {
        ...movie,
        similarityScore: finalScore,
        matchReason: movie.matchReason?.map(reason => 
          reason.startsWith('Same Actor') ? reason : reason
        )
      };
    });
    
    // Sort by enhanced similarity score
    return recommendedMovies.sort((a, b) => {
      // First by similarity score
      const scoreDiff = (b.similarityScore || 0) - (a.similarityScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      
      // Then by vote average weighted by vote count and popularity
      const scoreA = (a.vote_average * Math.log10(a.vote_count || 100)) * (a.popularity || 1);
      const scoreB = (b.vote_average * Math.log10(b.vote_count || 100)) * (b.popularity || 1);
      return scoreB - scoreA;
    });
    
  } catch (error) {
    console.error('Error in advanced recommendation system:', error);
    return [];
  }
};

// NEW - Get recommendations based on a combination of multiple movies
export const getHybridRecommendations = async (movieIds: number[]): Promise<Movie[]> => {
  try {
    if (movieIds.length === 0) return [];
    if (movieIds.length === 1) return getSimilarMovies(movieIds[0]);
    
    // Get recommendations for each individual movie
    const individualRecommendations = await Promise.all(
      movieIds.map(id => getSimilarMovies(id))
    );
    
    // Combine and find movies that appear in multiple recommendation sets
    const movieScores: Record<number, { 
      movie: Movie, 
      occurrences: number,
      totalScore: number 
    }> = {};
    
    // Process each set of recommendations
    individualRecommendations.forEach((recommendations, idx) => {
      recommendations.forEach((movie, position) => {
        if (!movieScores[movie.id]) {
          movieScores[movie.id] = {
            movie,
            occurrences: 1,
            // Higher weight for movies that appear in top positions
            totalScore: (movie.similarityScore || 0) * (1 - (position / recommendations.length) * 0.5)
          };
        } else {
          movieScores[movie.id].occurrences += 1;
          movieScores[movie.id].totalScore += (movie.similarityScore || 0) * 
            (1 - (position / recommendations.length) * 0.5);
        }
      });
    });
    
    // Calculate final score based on occurrences and original scores
    let hybridRecommendations = Object.values(movieScores)
      .map(({ movie, occurrences, totalScore }) => {
        // Calculate a weighted score that favors movies appearing in multiple recommendation sets
        const occurrenceBoost = occurrences / movieIds.length; // 1.0 if it appears in all sets
        const averageScore = totalScore / occurrences;
        const finalScore = Math.min(averageScore * (1 + occurrenceBoost), 95);
        
        return {
          ...movie,
          similarityScore: finalScore,
          matchReason: [
            ...(movie.matchReason || []),
            occurrences > 1 ? `Common across ${occurrences} selections` : ''
          ].filter(Boolean)
        };
      });
    
    // Remove any of the original movies from the recommendations
    hybridRecommendations = hybridRecommendations.filter(
      movie => !movieIds.includes(movie.id)
    );
    
    // Sort by the calculated score and add some natural variation
    return hybridRecommendations
      .sort((a, b) => {
        const scoreA = (a.similarityScore || 0) * (0.95 + Math.random() * 0.1);
        const scoreB = (b.similarityScore || 0) * (0.95 + Math.random() * 0.1);
        return scoreB - scoreA;
      })
      .slice(0, 50); // Limit to top 50
  } catch (error) {
    console.error('Error generating hybrid recommendations:', error);
    return [];
  }
};

// NEW - Generate recommendations based on user viewing history
export const getPersonalizedRecommendations = async (
  watchHistory: number[], 
  userRatings: Record<number, number> = {}
): Promise<Movie[]> => {
  try {
    if (watchHistory.length === 0) return [];
    
    // Calculate weight for each movie in history based on ratings
    const weightedHistory = watchHistory.map(id => {
      const rating = userRatings[id] || 5; // Default to 5/10 if no rating
      return {
        id,
        weight: rating / 10 // Normalize to 0-1 range
      };
    });
    
    // Sort by weight, higher ratings get more influence
    weightedHistory.sort((a, b) => b.weight - a.weight);
    
    // Take the top 5 most relevant movies from history
    const topRatedHistory = weightedHistory.slice(0, 5);
    
    // Generate recommendations based on these top movies
    const recommendationPromises = topRatedHistory.map(item => 
      getSimilarMovies(item.id, {
        weightDirector: item.weight * 0.8,  // More conservative weights
        weightGenre: item.weight * 0.6,    
        weightCast: item.weight * 0.7,     
        preferNewReleases: Object.entries(userRatings)
          .some(([id, rating]) => {
            if (rating >= 7) {
              const movie = watchHistory.find(m => m === parseInt(id));
              if (movie) {
                const releaseYear = new Date().getFullYear() - 5;
                return true;
              }
            }
            return false;
          })
      })
    );
    
    const recommendationSets = await Promise.all(recommendationPromises);
    
    // Process recommendations with weighted scores
    const weightedRecommendations: Record<number, {
      movie: Movie,
      score: number,
      sources: number[]
    }> = {};
    
    recommendationSets.forEach((recommendations, index) => {
      const sourceId = topRatedHistory[index].id;
      const weight = topRatedHistory[index].weight;
      
      recommendations.forEach((movie, position) => {
        if (watchHistory.includes(movie.id)) return;
        
        const positionScore = 1 - (position / recommendations.length);
        const weightedScore = Math.min(
          (movie.similarityScore || 0) * weight * (0.5 + 0.5 * positionScore),
          95
        );
        
        if (!weightedRecommendations[movie.id]) {
          weightedRecommendations[movie.id] = {
            movie,
            score: weightedScore,
            sources: [sourceId]
          };
        } else {
          weightedRecommendations[movie.id].score += weightedScore * 0.8; // Reduced stacking bonus
          weightedRecommendations[movie.id].sources.push(sourceId);
        }
      });
    });
    
    // Convert to array and add personalized reason
    const personalizedRecommendations = Object.values(weightedRecommendations)
      .map(({ movie, score, sources }) => ({
        ...movie,
        similarityScore: Math.min(score, 95), // Cap at 95%
        matchReason: [
          ...(movie.matchReason || []),
          sources.length > 1 
            ? `Based on ${sources.length} movies you enjoyed` 
            : `Based on movies you enjoyed`
        ],
        source: 'personalized'
      }));
    
    // Sort by score with some natural variation
    return personalizedRecommendations
      .sort((a, b) => {
        const scoreA = (a.similarityScore || 0) * (0.95 + Math.random() * 0.1);
        const scoreB = (b.similarityScore || 0) * (0.95 + Math.random() * 0.1);
        return scoreB - scoreA;
      })
      .slice(0, 50);
    
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return [];
  }
};

// Add the missing getTopIMDBMovies function
export const getTopIMDBMovies = async (): Promise<Movie[]> => {
  try {
    // Fetch movies with high IMDB ratings
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&vote_count.gte=5000&page=1&vote_average.gte=8`
    );
    
    if (!response.ok) {
      console.error('Failed to fetch top IMDB movies:', response.status);
      return [];
    }
    
    const data = await response.json();
    
    return data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      overview: movie.overview,
      popularity: movie.popularity || 0,
      vote_count: movie.vote_count || 0
    }));
  } catch (error) {
    console.error('Error fetching top IMDB movies:', error);
    return [];
  }
};
