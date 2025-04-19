
import { Movie } from '@/types/movie.types';
import { BASE_URL, API_KEY } from '@/config/api.config';
import { getFallbackMovies } from './fallbackService';

export const getSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  try {
    // Check if the movie is part of a collection/franchise first
    const movieResponse = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=keywords,collection`
    );
    
    const movieData = await movieResponse.json();
    let franchiseMovies: Movie[] = [];
    
    // If movie is part of a collection, get all movies in that collection
    if (movieData.collection && movieData.collection.id) {
      try {
        const collectionResponse = await fetch(
          `${BASE_URL}/collection/${movieData.collection.id}?api_key=${API_KEY}&language=en-US`
        );
        
        if (collectionResponse.ok) {
          const collectionData = await collectionResponse.json();
          
          franchiseMovies = collectionData.parts.map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            release_date: movie.release_date,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            overview: movie.overview,
            popularity: movie.popularity || 0,
            vote_count: movie.vote_count || 0,
            source: 'franchise'
          }));
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
      }
    }
    
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
          director_id: director.id,
          source: 'similar'
        }));
    }
    
    // Extract keywords from the movie
    const keywords = movieData.keywords?.keywords || [];
    
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
      overview: movie.overview,
      source: 'similar'
    }));

    // Get recommended movies
    const recommendedResponse = await fetch(
      `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
    );
    const recommendedData = await recommendedResponse.json();
    
    const recommendedMovies = recommendedData.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      overview: movie.overview,
      source: 'recommend'
    }));

    // Combine and deduplicate results
    const allMovies = [
      ...franchiseMovies, 
      ...directorMovies, 
      ...similarMovies,
      ...recommendedMovies
    ];
    
    const uniqueMovies = Array.from(new Set(allMovies.map(m => m.id)))
      .map(id => allMovies.find(m => m.id === id)!);

    // Ensure the original movie is not in the results
    const filteredMovies = uniqueMovies.filter(movie => movie.id !== movieId);

    // Get full details for the first 20 movies to get their genres
    const moviesWithDetails = await Promise.all(
      filteredMovies.slice(0, 20).map(async (movie) => {
        try {
          const detailsResponse = await fetch(
            `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=en-US`
          );
          
          if (!detailsResponse.ok) {
            return movie;
          }
          
          const detailsData = await detailsResponse.json();
          
          return {
            ...movie,
            genres: detailsData.genres,
            runtime: detailsData.runtime,
            vote_count: detailsData.vote_count,
            popularity: detailsData.popularity || movie.popularity
          };
        } catch (error) {
          console.error('Error fetching movie details:', error);
          return movie;
        }
      })
    );

    // Combine detailed movies with the rest
    const finalMovies = [
      ...moviesWithDetails,
      ...filteredMovies.slice(20)
    ];

    return finalMovies.slice(0, 40);
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
