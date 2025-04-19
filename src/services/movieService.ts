
export interface Movie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  overview: string;
}

export interface Genre {
  id: number;
  name: string;
}

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = '9149de13a04323237942d291f59c229d';

export const getGenres = async (): Promise<Genre[]> => {
  const response = await fetch(
    `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
  );
  const data = await response.json();
  return data.genres;
};

export const getMoviesByGenre = async (genreId: number): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US`
    );
    const data = await response.json();
    return data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      overview: movie.overview
    }));
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      overview: movie.overview
    }));
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

export const getSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      overview: movie.overview
    }));
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    return [];
  }
};

// In case of API failure, provide some sample movies
export const getFallbackMovies = (genre: string): Movie[] => {
  const fallbackMovies = [
    {
      id: 1,
      title: `The Ultimate ${genre} Movie`,
      release_date: '2024-01-01',
      poster_path: '/placeholder.svg',
      vote_average: 7.5,
      overview: 'A high-quality movie in this genre with an engaging plot.'
    },
    {
      id: 2,
      title: `Best of ${genre}`,
      release_date: '2024-02-01',
      poster_path: '/placeholder.svg',
      vote_average: 8.0,
      overview: 'Critics are raving about this masterpiece that redefines the genre.'
    },
    {
      id: 3,
      title: `${genre} Heroes`,
      release_date: '2024-03-01',
      poster_path: '/placeholder.svg',
      vote_average: 7.8,
      overview: 'An epic tale that will leave you wanting more.'
    },
    {
      id: 4,
      title: `${genre} Adventures`,
      release_date: '2024-04-01',
      poster_path: '/placeholder.svg',
      vote_average: 8.2,
      overview: 'A breathtaking journey that pushes the boundaries of imagination.'
    }
  ];
  
  // If genre is "Search" (direct search), provide different movies
  if (genre === 'Search') {
    return [
      {
        id: 5,
        title: 'Popular Movie A',
        release_date: '2024-01-15',
        poster_path: '/placeholder.svg',
        vote_average: 7.9,
        overview: 'A trending movie that everyone is talking about.'
      },
      {
        id: 6,
        title: 'Popular Movie B',
        release_date: '2024-02-15',
        poster_path: '/placeholder.svg',
        vote_average: 8.1,
        overview: 'This blockbuster has been breaking box office records.'
      },
      {
        id: 7,
        title: 'Top Movie C',
        release_date: '2024-03-15',
        poster_path: '/placeholder.svg',
        vote_average: 7.7,
        overview: 'A compelling story with unforgettable characters.'
      },
      {
        id: 8,
        title: 'Classic Movie D',
        release_date: '2024-04-15',
        poster_path: '/placeholder.svg',
        vote_average: 8.3,
        overview: 'This instant classic has redefined cinema.'
      }
    ];
  }
  
  return fallbackMovies;
};
