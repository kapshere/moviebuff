const API_KEY = '44e140e2'; // This is a public API key for OMDb API
const BASE_URL = 'https://www.omdbapi.com';

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
    // Since OMDb doesn't support genre-based search directly, we'll search by genre keywords
    const genreKeywords: Record<number, string> = {
      28: 'action',
      35: 'comedy',
      18: 'drama',
      27: 'horror',
      53: 'thriller',
      10749: 'romance',
      878: 'sci-fi',
      10751: 'family',
      12: 'adventure',
      16: 'animation'
    };

    const keyword = genreKeywords[genreId] || 'movie';
    const response = await fetch(
      `${BASE_URL}/?apikey=${API_KEY}&s=${keyword}&type=movie`
    );
    
    if (!response.ok) {
      console.error('API response error:', await response.text());
      return [];
    }
    
    const data = await response.json();
    
    if (data.Response === 'False') {
      console.error('API error:', data.Error);
      return [];
    }

    // Transform OMDb response format to match our Movie interface
    return data.Search.map((movie: any) => ({
      id: parseInt(movie.imdbID.slice(2)) || Math.random() * 10000,
      title: movie.Title,
      release_date: movie.Year + '-01-01',
      poster_path: movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.svg',
      vote_average: 7.5, // OMDb free tier doesn't include ratings
      overview: 'A fascinating movie in this genre.' // OMDb free tier doesn't include plot
    }));
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return [];
  }
};

export const getGenres = async () => {
  // Return static genres since OMDb doesn't have a genres endpoint
  return [
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' },
    { id: 18, name: 'Drama' },
    { id: 27, name: 'Horror' },
    { id: 53, name: 'Thriller' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10751, name: 'Family' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' }
  ];
};

export const getSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  try {
    // For similar movies, we'll just fetch more movies from the same genre
    // since OMDb doesn't have a similar movies endpoint
    const response = await fetch(
      `${BASE_URL}/?apikey=${API_KEY}&s=movie&type=movie&page=${Math.floor(Math.random() * 5) + 1}`
    );
    
    if (!response.ok) {
      console.error('API response error:', await response.text());
      return [];
    }
    
    const data = await response.json();
    
    if (data.Response === 'False') {
      console.error('API error:', data.Error);
      return [];
    }

    return data.Search.map((movie: any) => ({
      id: parseInt(movie.imdbID.slice(2)) || Math.random() * 10000,
      title: movie.Title,
      release_date: movie.Year + '-01-01',
      poster_path: movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.svg',
      vote_average: 7.5,
      overview: 'A fascinating movie in this genre.'
    }));
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
