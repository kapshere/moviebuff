
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
    const movies: Movie[] = [];
    const pagesToFetch = 6;
    
    for (let page = 1; page <= pagesToFetch; page++) {
      const response = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=50&language=en-US&page=${page}`
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
    console.error('Error fetching movies:', error);
    return [];
  }
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  try {
    let allMovies: Movie[] = [];  // Changed from const to let
    const pagesToFetch = 5;
    
    const isHangoverSearch = query.toLowerCase().includes("hangover") && 
                             (query.toLowerCase().includes("the") || 
                              query.toLowerCase() === "hangover");
    
    const hangoverFranchiseIds = [
      18785,  // The Hangover (2009)
      45243,  // The Hangover Part II (2011)
      109439  // The Hangover Part III (2013)
    ];
    
    if (isHangoverSearch) {
      const hangoverResponse = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=the%20hangover&language=en-US&page=1`
      );
      const hangoverData = await hangoverResponse.json();
      
      const hangoverMovies = hangoverData.results
        .filter((movie: any) => hangoverFranchiseIds.includes(movie.id))
        .map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          overview: movie.overview,
          popularity: movie.popularity,
          vote_count: movie.vote_count
        }));
      
      allMovies.push(...hangoverMovies);
      
      if (allMovies.length > 0) {
        return allMovies;
      }
    }
    
    for (let page = 1; page <= pagesToFetch; page++) {
      const directResponse = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=${page}`
      );
      const directData = await directResponse.json();
      
      if (directData.results && directData.results.length > 0) {
        const pageMovies = directData.results.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          overview: movie.overview,
          popularity: movie.popularity,
          vote_count: movie.vote_count
        }));
        
        allMovies.push(...pageMovies);
      }
    }
    
    if (allMovies.length < 10) {
      const words = query.split(' ');
      for (const word of words) {
        if (word.length > 2) {
          const broadResponse = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(word)}&language=en-US&page=1`
          );
          const broadData = await broadResponse.json();
          
          const additionalMovies = broadData.results
            .filter((movie: any) => !allMovies.some(m => m.id === movie.id))
            .map((movie: any) => ({
              id: movie.id,
              title: movie.title,
              release_date: movie.release_date,
              poster_path: movie.poster_path,
              vote_average: movie.vote_average,
              overview: movie.overview,
              popularity: movie.popularity,
              vote_count: movie.vote_count
            }));
          
          allMovies.push(...additionalMovies);
        }
      }
      
      const popularResponse = await fetch(
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
      );
      const popularData = await popularResponse.json();
      
      const popularMovies = popularData.results
        .filter((movie: any) => {
          return words.some(word => 
            word.length > 2 && 
            movie.title.toLowerCase().includes(word.toLowerCase())
          );
        })
        .filter((movie: any) => !allMovies.some(m => m.id === movie.id))
        .map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          release_date: movie.release_date,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          overview: movie.overview,
          popularity: movie.popularity,
          vote_count: movie.vote_count
        }));
      
      allMovies.push(...popularMovies);
    }
    
    if (query.toLowerCase().includes("hangover")) {
      const hangoverResponse = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=hangover&language=en-US&page=1`
      );
      const hangoverData = await hangoverResponse.json();
      
      const hangoverMovies = hangoverData.results.filter((movie: any) => 
        movie.title.toLowerCase().includes("hangover")
      );
      
      if (isHangoverSearch) {
        const officialHangoverMovies = hangoverMovies.filter((movie: any) => 
          hangoverFranchiseIds.includes(movie.id)
        );
        
        const nonHangoverMovies = allMovies.filter(movie => 
          !movie.title.toLowerCase().includes("hangover")
        );
        
        return [
          ...officialHangoverMovies.map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            release_date: movie.release_date,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            overview: movie.overview,
            popularity: movie.popularity,
            vote_count: movie.vote_count
          })),
          ...nonHangoverMovies
        ];
      } else {
        const newHangoverMovies = hangoverMovies
          .filter((movie: any) => !allMovies.some(m => m.id === movie.id))
          .map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            release_date: movie.release_date,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            overview: movie.overview,
            popularity: movie.popularity,
            vote_count: movie.vote_count
          }));
        
        allMovies.push(...newHangoverMovies);
      }
      
      allMovies = allMovies.filter((movie, index, self) =>
        index === self.findIndex((m) => m.id === movie.id)
      ).sort((a, b) => {
        const aHasExactMatch = a.title.toLowerCase().includes(query.toLowerCase());
        const bHasExactMatch = b.title.toLowerCase().includes(query.toLowerCase());
        
        if (aHasExactMatch && !bHasExactMatch) return -1;
        if (!aHasExactMatch && bHasExactMatch) return 1;
        
        return b.popularity - a.popularity;
      });
    }
    
    return allMovies.sort((a, b) => {
      const aHasExactMatch = a.title.toLowerCase().includes(query.toLowerCase());
      const bHasExactMatch = b.title.toLowerCase().includes(query.toLowerCase());
      
      if (aHasExactMatch && !bHasExactMatch) return -1;
      if (!aHasExactMatch && bHasExactMatch) return 1;
      
      return b.popularity - a.popularity;
    });
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
    const movieDetails = await getMovieDetails(movieId);
    
    if (!movieDetails) {
      throw new Error("Could not fetch movie details");
    }
    
    const primaryGenres = movieDetails.genres?.map(g => g.id) || [];
    if (primaryGenres.length === 0) {
      throw new Error("No genres found for the movie");
    }
    
    const isSeries = /\d+$|\s\d+$|\s\d+:/.test(movieDetails.title);
    let seriesTitle = "";
    if (isSeries) {
      seriesTitle = movieDetails.title.replace(/\s*\d+(:.*)?$|\s+\d+$/, '').trim();
    } else {
      const colonIndex = movieDetails.title.indexOf(':');
      seriesTitle = colonIndex > 0 ? movieDetails.title.substring(0, colonIndex).trim() : movieDetails.title;
    }
    
    const isHangoverMovie = movieDetails.title.toLowerCase().includes("hangover");
    
    let franchiseMovies: any[] = [];
    if (seriesTitle) {
      if (isHangoverMovie) {
        const hangoverFranchiseIds = [
          18785,  // The Hangover (2009)
          45243,  // The Hangover Part II (2011)
          109439  // The Hangover Part III (2013)
        ];
        
        for (const franchiseId of hangoverFranchiseIds) {
          if (franchiseId === movieId) continue;
          
          try {
            const movieResponse = await fetch(
              `${BASE_URL}/movie/${franchiseId}?api_key=${API_KEY}&language=en-US`
            );
            const movieData = await movieResponse.json();
            
            if (movieData && movieData.id) {
              franchiseMovies.push(movieData);
            }
          } catch (err) {
            console.error(`Error fetching hangover movie ${franchiseId}:`, err);
          }
        }
      } else {
        const franchiseResponse = await fetch(
          `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(seriesTitle)}&language=en-US&page=1`
        );
        const franchiseData = await franchiseResponse.json();
        
        franchiseMovies = franchiseData.results.filter((movie: any) => {
          return movie.id !== movieId && 
                 (movie.title.toLowerCase().includes(seriesTitle.toLowerCase()) || 
                  seriesTitle.toLowerCase().includes(movie.title.toLowerCase()));
        });
      }
    }
    
    const similarMovies: any[] = [];
    for (let page = 1; page <= 3; page++) {
      const similarResponse = await fetch(
        `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=${page}`
      );
      const similarData = await similarResponse.json();
      similarMovies.push(...similarData.results);
    }
    
    const recommendMovies: any[] = [];
    for (let page = 1; page <= 3; page++) {
      const recommendResponse = await fetch(
        `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US&page=${page}`
      );
      const recommendData = await recommendResponse.json();
      recommendMovies.push(...recommendData.results);
    }
    
    const genreMovies: any[] = [];
    for (const genreId of primaryGenres.slice(0, 3)) {
      for (let page = 1; page <= 2; page++) {
        const genreResponse = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=100&language=en-US&page=${page}`
        );
        const genreData = await genreResponse.json();
        genreMovies.push(...genreData.results.filter((m: any) => m.id !== movieId));
      }
    }
    
    let keywordMovies: any[] = [];
    if (seriesTitle) {
      const keywordResponse = await fetch(
        `${BASE_URL}/search/keyword?api_key=${API_KEY}&query=${encodeURIComponent(seriesTitle)}&page=1`
      );
      const keywordData = await keywordResponse.json();
      
      if (keywordData.results && keywordData.results.length > 0) {
        const topKeywords = keywordData.results.slice(0, 5).map((k: any) => k.id);
        
        for (const keywordId of topKeywords) {
          const keywordMovieResponse = await fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_keywords=${keywordId}&sort_by=popularity.desc&vote_count.gte=50&language=en-US&page=1`
          );
          const keywordMovieData = await keywordMovieResponse.json();
          keywordMovies.push(...keywordMovieData.results);
        }
      }
    }
    
    if (isHangoverMovie) {
      const hangoverResponse = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=hangover&language=en-US&page=1`
      );
      const hangoverData = await hangoverResponse.json();
      
      const hangoverMovies = hangoverData.results.filter((movie: any) => 
        movie.id !== movieId && movie.title.toLowerCase().includes("hangover")
      );
      
      franchiseMovies.push(...hangoverMovies);
      
      franchiseMovies = franchiseMovies.filter((movie, index, self) =>
        index === self.findIndex((m) => m.id === movie.id)
      );
    }
    
    const allCandidateMovies = [
      ...franchiseMovies.map(movie => ({ 
        ...movie, 
        source: 'franchise', 
        baseScore: 100 
      })),
      ...similarMovies.map(movie => ({ 
        ...movie, 
        source: 'similar', 
        baseScore: 60
      })),
      ...recommendMovies.map(movie => ({ 
        ...movie, 
        source: 'recommend', 
        baseScore: 50
      })),
      ...genreMovies.map(movie => ({ 
        ...movie, 
        source: 'genre', 
        baseScore: 70
      })),
      ...keywordMovies.map(movie => ({ 
        ...movie, 
        source: 'keyword', 
        baseScore: 40
      }))
    ];
    
    const uniqueMoviesMap = new Map();
    allCandidateMovies.forEach(movie => {
      const existing = uniqueMoviesMap.get(movie.id);
      if (!existing || existing.baseScore < movie.baseScore) {
        uniqueMoviesMap.set(movie.id, movie);
      }
    });
    
    let uniqueMovies = Array.from(uniqueMoviesMap.values());  // Changed from const to let
    
    uniqueMovies = uniqueMovies.filter(movie => movie.id !== movieId);
    
    const movieGenresPromises = uniqueMovies.map(async (movie) => {
      try {
        const detailsResponse = await fetch(
          `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=en-US`
        );
        const details = await detailsResponse.json();
        
        const movieGenreIds = details.genres?.map((g: any) => g.id) || [];
        const genreOverlap = movieGenreIds.filter((id: number) => primaryGenres.includes(id)).length;
        const genreScore = genreOverlap / Math.max(1, primaryGenres.length) * 50;
        
        return {
          ...movie,
          genreScore,
          genres: details.genres || []
        };
      } catch (error) {
        return {
          ...movie,
          genreScore: 0,
          genres: []
        };
      }
    });
    
    const moviesWithGenres = await Promise.all(movieGenresPromises);
    
    let scoredMovies = moviesWithGenres.map(movie => {
      let finalScore = movie.baseScore || 0;
      
      finalScore += movie.genreScore || 0;
      
      finalScore += Math.min(20, (movie.vote_average || 0) * 2);
      
      finalScore += Math.min(20, (movie.popularity || 0) / 50);
      
      finalScore += Math.min(10, Math.log10((movie.vote_count || 0) + 1));
      
      const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;
      const currentYear = new Date().getFullYear();
      const yearDiff = Math.max(0, Math.min(30, currentYear - releaseYear));
      finalScore += Math.max(0, 15 - yearDiff * 0.5);
      
      if (movie.title && seriesTitle && 
          (movie.title.toLowerCase().includes(seriesTitle.toLowerCase()) || 
           seriesTitle.toLowerCase().includes(movie.title.toLowerCase()))) {
        finalScore += 40;
      }
      
      if (isHangoverMovie && movie.title.toLowerCase().includes("hangover")) {
        finalScore += 60;
      }
      
      return {
        ...movie,
        finalScore
      };
    });
    
    scoredMovies = scoredMovies.map(movie => {
      if (isHangoverMovie) {
        const hangoverFranchiseIds = [18785, 45243, 109439];
        if (hangoverFranchiseIds.includes(movie.id)) {
          return {
            ...movie,
            finalScore: 1000 + (movie.finalScore || 0),
            source: 'franchise'
          };
        }
      }
      return movie;
    });
    
    return scoredMovies.sort((a, b) => b.finalScore - a.finalScore).slice(0, 40).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
      overview: movie.overview,
      vote_count: movie.vote_count,
      popularity: movie.popularity,
      genres: movie.genres,
      source: movie.source,
      score: movie.finalScore
    }));
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
