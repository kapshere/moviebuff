export interface Movie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  vote_average: number;
  overview: string;
  genres?: Genre[];
  runtime?: number;
  vote_count?: number;
  popularity?: number;
  tagline?: string;
  backdrop_path?: string | null;
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
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=1000&language=en-US`
    );
    const data = await response.json();
    return data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      overview: movie.overview,
      popularity: movie.popularity,
      vote_count: movie.vote_count
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
      overview: movie.overview,
      popularity: movie.popularity,
      vote_count: movie.vote_count
    }));
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
};

export const getMovieDetails = async (movieId: number): Promise<Movie | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=credits,similar,recommendations`
    );
    const data = await response.json();
    
    return {
      id: data.id,
      title: data.title,
      release_date: data.release_date,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      overview: data.overview,
      genres: data.genres,
      runtime: data.runtime,
      popularity: data.popularity,
      tagline: data.tagline
    };
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

export const getSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  try {
    // Get movie details first to enhance the recommendations
    const movieDetails = await getMovieDetails(movieId);
    
    if (!movieDetails) {
      throw new Error("Could not fetch movie details");
    }
    
    // Get similar movies
    const similarResponse = await fetch(
      `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=1`
    );
    const similarData = await similarResponse.json();
    
    // Get recommendations
    const recommendResponse = await fetch(
      `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
    );
    const recommendData = await recommendResponse.json();
    
    // Combine the two lists, but prioritize movies with higher vote counts
    let combinedMovies = [
      ...similarData.results,
      ...recommendData.results
    ];
    
    // Remove duplicates
    const uniqueMovies = Array.from(
      new Map(combinedMovies.map(movie => [movie.id, movie])).values()
    );
    
    // Sort by relevance (combination of popularity and vote average)
    const relevantMovies = uniqueMovies.sort((a, b) => {
      const scoreA = (a.vote_average * Math.log10(a.vote_count + 1)) + (a.popularity / 100);
      const scoreB = (b.vote_average * Math.log10(b.vote_count + 1)) + (b.popularity / 100);
      return scoreB - scoreA;
    });
    
    // Map the results
    return relevantMovies.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      overview: movie.overview,
      vote_count: movie.vote_count,
      popularity: movie.popularity
    }));
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    return [];
  }
};

// Get top rated IMDB movies
export const getTopIMDBMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      overview: movie.overview,
      popularity: movie.popularity,
      vote_count: movie.vote_count
    }));
  } catch (error) {
    console.error('Error fetching top IMDB movies:', error);
    return [];
  }
};

// In case of API failure, provide some sample movies
export const getFallbackMovies = (genre: string): Movie[] => {
  const fallbackMovies = [
    {
      id: 1,
      title: `Most Popular ${genre} Movie`,
      release_date: '2024-01-01',
      poster_path: '/placeholder.svg',
      vote_average: 8.5,
      overview: 'One of the most watched and beloved movies in this genre.',
      vote_count: 50000,
      popularity: 986.7
    },
    {
      id: 2,
      title: `Best of ${genre}`,
      release_date: '2024-02-01',
      poster_path: '/placeholder.svg',
      vote_average: 8.0,
      overview: 'Critics are raving about this masterpiece that redefines the genre.',
      vote_count: 345,
      popularity: 78.2
    },
    {
      id: 3,
      title: `${genre} Heroes`,
      release_date: '2024-03-01',
      poster_path: '/placeholder.svg',
      vote_average: 7.8,
      overview: 'An epic tale that will leave you wanting more.',
      vote_count: 275,
      popularity: 67.9
    },
    {
      id: 4,
      title: `${genre} Adventures`,
      release_date: '2024-04-01',
      poster_path: '/placeholder.svg',
      vote_average: 8.2,
      overview: 'A breathtaking journey that pushes the boundaries of imagination.',
      vote_count: 410,
      popularity: 82.3
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
        overview: 'A trending movie that everyone is talking about.',
        vote_count: 320,
        popularity: 74.1
      },
      {
        id: 6,
        title: 'Popular Movie B',
        release_date: '2024-02-15',
        poster_path: '/placeholder.svg',
        vote_average: 8.1,
        overview: 'This blockbuster has been breaking box office records.',
        vote_count: 385,
        popularity: 86.7
      },
      {
        id: 7,
        title: 'Top Movie C',
        release_date: '2024-03-15',
        poster_path: '/placeholder.svg',
        vote_average: 7.7,
        overview: 'A compelling story with unforgettable characters.',
        vote_count: 290,
        popularity: 69.3
      },
      {
        id: 8,
        title: 'Classic Movie D',
        release_date: '2024-04-15',
        poster_path: '/placeholder.svg',
        vote_average: 8.3,
        overview: 'This instant classic has redefined cinema.',
        vote_count: 440,
        popularity: 91.8
      }
    ];
  }
  
  // If genre is Top IMDB, provide high-rated movies
  if (genre === 'Top') {
    return [
      {
        id: 9,
        title: 'The Shawshank Redemption',
        release_date: '1994-09-23',
        poster_path: '/placeholder.svg',
        vote_average: 9.3,
        overview: 'Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.',
        vote_count: 24680,
        popularity: 97.5
      },
      {
        id: 10,
        title: 'The Godfather',
        release_date: '1972-03-14',
        poster_path: '/placeholder.svg',
        vote_average: 9.2,
        overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        vote_count: 18670,
        popularity: 95.3
      },
      {
        id: 11,
        title: 'The Dark Knight',
        release_date: '2008-07-18',
        poster_path: '/placeholder.svg',
        vote_average: 9.0,
        overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        vote_count: 29840,
        popularity: 98.7
      },
      {
        id: 12,
        title: 'Pulp Fiction',
        release_date: '1994-10-14',
        poster_path: '/placeholder.svg',
        vote_average: 8.9,
        overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
        vote_count: 23560,
        popularity: 94.1
      }
    ];
  }
  
  return fallbackMovies;
};
