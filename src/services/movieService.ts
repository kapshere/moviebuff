
import { Movie } from '@/types/movie.types';
import { BASE_URL, API_KEY } from '@/config/api.config';

export const getMovieDetails = async (movieId: number): Promise<Movie | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=credits`
    );
    
    const data = await response.json();
    
    // Find the director from the credits
    const director = data.credits?.crew?.find((person: any) => person.job === 'Director');
    
    return {
      id: data.id,
      title: data.title,
      release_date: data.release_date,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      vote_average: data.vote_average,
      overview: data.overview,
      genres: data.genres,
      runtime: data.runtime,
      vote_count: data.vote_count,
      popularity: data.popularity,
      tagline: data.tagline,
      director: director?.name,
      director_id: director?.id
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

// Export the searchMovies function to maintain compatibility with existing code
export { searchMovies } from './searchService';

// Also export other functions that might be imported directly from movieService
export { 
  getMoviesByGenre, 
  getGenres 
} from './genreService';

export { 
  getSimilarMovies,
  getTopIMDBMovies
} from './recommendationService';

export { 
  getFallbackMovies 
} from './fallbackService';

// Re-export types
export * from '../types/movie.types';
