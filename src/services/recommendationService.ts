
import { Movie } from '@/types/movie.types';
import { BASE_URL, API_KEY } from '@/config/api.config';
import { getFallbackMovies } from './fallbackService';

export const getSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  try {
    // Get movie credits to find the director
    const creditsResponse = await fetch(
      `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}&language=en-US`
    );
    const creditsData = await creditsResponse.json();
    
    const director = creditsData.crew.find((person: any) => person.job === 'Director');
    let directorMovies: Movie[] = [];
    
    if (director) {
      // Get other movies by the same director
      const directorResponse = await fetch(
        `${BASE_URL}/person/${director.id}/movie_credits?api_key=${API_KEY}&language=en-US`
      );
      const directorData = await directorResponse.json();
      
      directorMovies = directorData.crew
        .filter((credit: any) => credit.job === 'Director' && credit.id !== movieId)
        .map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          overview: movie.overview,
          director: director.name,
          director_id: director.id
        }));
    }
    
    // Get similar movies based on content
    const similarResponse = await fetch(
      `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=1`
    );
    const similarData = await similarResponse.json();
    
    const similarMovies = similarData.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      overview: movie.overview
    }));

    // Combine and deduplicate results
    const allMovies = [...directorMovies, ...similarMovies];
    const uniqueMovies = Array.from(new Set(allMovies.map(m => m.id)))
      .map(id => allMovies.find(m => m.id === id)!);

    return uniqueMovies.slice(0, 40);
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    return [];
  }
};

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
