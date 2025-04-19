
const API_KEY = 'a780aa21f2ca2475b5cd14df069caa94'; // This is a public API key for TMDB
const BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
  vote_average: number;
  overview: string;
}

export const getMoviesByGenre = async (genreId: number): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en-US&sort_by=popularity.desc`
    );
    
    if (!response.ok) {
      console.error('API response error:', await response.text());
      return [];
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return [];
  }
};

export const getGenres = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
    );
    
    if (!response.ok) {
      console.error('API response error:', await response.text());
      return [];
    }
    
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

export const getSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=1`
    );
    
    if (!response.ok) {
      console.error('API response error:', await response.text());
      return [];
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    return [];
  }
};

// Fallback data in case the API fails
export const getFallbackMovies = (genre: string): Movie[] => {
  return [
    {
      id: 1,
      title: `Sample ${genre} Movie 1`,
      release_date: '2023-01-01',
      poster_path: '/placeholder.svg',
      vote_average: 8.5,
      overview: 'This is a placeholder movie when the API is unavailable.'
    },
    {
      id: 2,
      title: `Sample ${genre} Movie 2`,
      release_date: '2023-02-15',
      poster_path: '/placeholder.svg',
      vote_average: 7.8,
      overview: 'Another placeholder movie for demonstration purposes.'
    },
    {
      id: 3,
      title: `Sample ${genre} Movie 3`,
      release_date: '2023-03-20',
      poster_path: '/placeholder.svg',
      vote_average: 9.0,
      overview: 'A third placeholder movie to show when the API is down.'
    }
  ];
};
