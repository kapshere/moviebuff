
import { Movie } from '@/types/movie.types';
import { BASE_URL, API_KEY } from '@/config/api.config';
import { getFallbackMovies } from './fallbackService';

// Advanced content-based recommendation system
export const getSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  try {
    // First, get comprehensive details about the target movie
    const movieResponse = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=keywords,credits,similar,recommendations,videos`
    );
    
    if (!movieResponse.ok) {
      console.error('Failed to fetch movie details for recommendation:', movieResponse.status);
      return [];
    }
    
    const movieData = await movieResponse.json();
    const recommendations: Record<number, Movie & { similarityScore?: number; matchReason?: string[] }> = {};
    
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
                similarityScore: 100, // Maximum score for franchise movies
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
    
    // Step 2: Director Analysis - Same director often means similar style/themes
    const directors = movieData.credits?.crew?.filter((person: any) => person.job === 'Director') || [];
    
    if (directors.length > 0) {
      for (const director of directors) {
        try {
          const directorResponse = await fetch(
            `${BASE_URL}/person/${director.id}/movie_credits?api_key=${API_KEY}&language=en-US`
          );
          
          if (directorResponse.ok) {
            const directorData = await directorResponse.json();
            
            // Get only directorial works, not acting or other roles
            const directedMovies = directorData.crew.filter((credit: any) => 
              credit.job === 'Director' && credit.id !== movieId
            );
            
            for (const movie of directedMovies) {
              // If we already have this movie but not with this reason, just add the reason
              if (recommendations[movie.id]) {
                if (!recommendations[movie.id].matchReason?.includes('Same Director')) {
                  recommendations[movie.id].matchReason?.push('Same Director');
                  // Boost score for multiple match reasons
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
                  similarityScore: 85, // High score for same director
                  matchReason: ['Same Director'],
                  director: director.name,
                  director_id: director.id,
                  source: 'director'
                };
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching movies for director ${director.name}:`, error);
        }
      }
    }
    
    // Step 3: Cast Analysis - Movies with same lead actors often have similar audience
    const mainCast = movieData.credits?.cast?.slice(0, 4) || []; // Consider only top 4 billed actors
    
    if (mainCast.length > 0) {
      for (const actor of mainCast) {
        try {
          const actorResponse = await fetch(
            `${BASE_URL}/person/${actor.id}/movie_credits?api_key=${API_KEY}&language=en-US`
          );
          
          if (actorResponse.ok) {
            const actorData = await actorResponse.json();
            
            // Get movies where they had major roles (top 5 billing)
            const leadRoles = actorData.cast.filter((credit: any) => 
              credit.id !== movieId && credit.order < 5
            ).slice(0, 8); // Limit to avoid too many results
            
            for (const movie of leadRoles) {
              if (recommendations[movie.id]) {
                if (!recommendations[movie.id].matchReason?.includes('Same Lead Actor')) {
                  recommendations[movie.id].matchReason?.push('Same Lead Actor');
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
                  similarityScore: 75, // Good score for lead actor overlap
                  matchReason: ['Same Lead Actor'],
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
                  similarityScore: 65, // Decent score for thematic similarity
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
                similarityScore: 60, // Base score for genre match
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
          similarityScore: 70, // Good score for TMDB's own recommendations
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
                similarityScore: 50, // Lower score for just era matching
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
    
    // Convert the recommendations object to an array and sort by similarity score
    let recommendedMovies = Object.values(recommendations);
    
    // Get detailed information for top recommendations to improve display quality
    const detailedRecommendations = await Promise.all(
      recommendedMovies.slice(0, 30).map(async (movie) => {
        try {
          const detailsResponse = await fetch(
            `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=en-US&append_to_response=credits`
          );
          
          if (!detailsResponse.ok) {
            return movie;
          }
          
          const detailsData = await detailsResponse.json();
          
          // Find the director if available
          const director = detailsData.credits?.crew?.find((person: any) => person.job === 'Director');
          
          return {
            ...movie,
            genres: detailsData.genres,
            runtime: detailsData.runtime,
            tagline: detailsData.tagline,
            backdrop_path: detailsData.backdrop_path,
            director: director?.name || movie.director,
            director_id: director?.id || movie.director_id,
          };
        } catch (error) {
          console.error(`Error fetching details for movie ${movie.id}:`, error);
          return movie;
        }
      })
    );
    
    // Sort by similarity score (higher is better)
    return detailedRecommendations.sort((a, b) => {
      // First by similarity score
      const scoreDiff = (b.similarityScore || 0) - (a.similarityScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      
      // Then by vote average (weighted by vote count)
      const scoreA = a.vote_average * Math.log10(a.vote_count || 100);
      const scoreB = b.vote_average * Math.log10(b.vote_count || 100);
      return scoreB - scoreA;
    });
    
  } catch (error) {
    console.error('Error in advanced recommendation system:', error);
    return [];
  }
};

// Fetch top rated movies from IMDB (TMDB proxy for this)
export const getTopIMDBMovies = async (): Promise<Movie[]> => {
  try {
    const movies: Movie[] = [];
    const pagesToFetch = 6;
    
    for (let page = 1; page <= pagesToFetch; page++) {
      const response = await fetch(
        `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`
      );
      const data = await response.json();
      
      const pageMovies = data.results.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        overview: movie.overview,
        popularity: movie.popularity,
        vote_count: movie.vote_count
      }));
      
      movies.push(...pageMovies);
    }
    
    return movies;
  } catch (error) {
    console.error('Error fetching top IMDB movies:', error);
    return [];
  }
};

// Advanced movie discovery with multiple parameters for better recommendations
export const discoverMoviesByParams = async (params: {
  genres?: number[];
  year?: number;
  voteMin?: number;
  sortBy?: string;
  withCast?: number[];
  withDirector?: number;
  withKeywords?: number[];
}): Promise<Movie[]> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('api_key', API_KEY);
    queryParams.append('language', 'en-US');
    queryParams.append('page', '1');
    queryParams.append('include_adult', 'false');
    
    if (params.genres && params.genres.length > 0) {
      queryParams.append('with_genres', params.genres.join(','));
    }
    
    if (params.year) {
      queryParams.append('primary_release_year', params.year.toString());
    }
    
    if (params.voteMin) {
      queryParams.append('vote_average.gte', params.voteMin.toString());
      queryParams.append('vote_count.gte', '100'); // Ensure enough votes
    }
    
    if (params.sortBy) {
      queryParams.append('sort_by', params.sortBy);
    } else {
      queryParams.append('sort_by', 'popularity.desc');
    }
    
    if (params.withCast && params.withCast.length > 0) {
      queryParams.append('with_cast', params.withCast.join('|'));
    }
    
    if (params.withDirector) {
      queryParams.append('with_crew', params.withDirector.toString());
    }
    
    if (params.withKeywords && params.withKeywords.length > 0) {
      queryParams.append('with_keywords', params.withKeywords.join('|'));
    }
    
    const response = await fetch(
      `${BASE_URL}/discover/movie?${queryParams.toString()}`
    );
    
    if (!response.ok) {
      throw new Error(`Discovery API responded with: ${response.status}`);
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
    console.error('Error in movie discovery:', error);
    return [];
  }
};
