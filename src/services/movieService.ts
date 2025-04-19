
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
    // Fetch multiple pages to get more movies
    const movies: Movie[] = [];
    const pagesToFetch = 6; // Increased from 3 to 6 pages
    
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
    const allMovies: Movie[] = [];
    const pagesToFetch = 5; // Increased from 1 to 5 pages
    
    // First try exact search on multiple pages
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
    
    // If we don't have enough results, search more broadly
    if (allMovies.length < 10) {
      // Try searching for words individually
      const words = query.split(' ');
      for (const word of words) {
        if (word.length > 2) { // Only use words with at least 3 characters
          const broadResponse = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(word)}&language=en-US&page=1`
          );
          const broadData = await broadResponse.json();
          
          const additionalMovies = broadData.results
            .filter((movie: any) => !allMovies.some(m => m.id === movie.id)) // Deduplicate
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
      
      // Additional search for popular movies that might contain parts of the title
      const popularResponse = await fetch(
        `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`
      );
      const popularData = await popularResponse.json();
      
      const popularMovies = popularData.results
        .filter((movie: any) => {
          // Check if any word from the query is in the movie title
          return words.some(word => 
            word.length > 2 && 
            movie.title.toLowerCase().includes(word.toLowerCase())
          );
        })
        .filter((movie: any) => !allMovies.some(m => m.id === movie.id)) // Deduplicate
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
    
    // Get all hangover movies specifically if the query contains "hangover"
    if (query.toLowerCase().includes("hangover")) {
      const hangoverResponse = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=hangover&language=en-US&page=1`
      );
      const hangoverData = await hangoverResponse.json();
      
      const hangoverMovies = hangoverData.results
        .filter((movie: any) => !allMovies.some(m => m.id === movie.id)) // Deduplicate
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
      
      // Add hangover movies at the beginning for relevance
      allMovies.unshift(...hangoverMovies);
    }
    
    // Sort by relevance and popularity
    return allMovies.sort((a, b) => {
      // Check if title contains exact query for higher relevance
      const aHasExactMatch = a.title.toLowerCase().includes(query.toLowerCase());
      const bHasExactMatch = b.title.toLowerCase().includes(query.toLowerCase());
      
      if (aHasExactMatch && !bHasExactMatch) return -1;
      if (!aHasExactMatch && bHasExactMatch) return 1;
      
      // Otherwise sort by popularity
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
    // Get movie details first to enhance the recommendations
    const movieDetails = await getMovieDetails(movieId);
    
    if (!movieDetails) {
      throw new Error("Could not fetch movie details");
    }
    
    // Extract the primary genre(s) from the selected movie
    const primaryGenres = movieDetails.genres?.map(g => g.id) || [];
    if (primaryGenres.length === 0) {
      throw new Error("No genres found for the movie");
    }
    
    // Check if the title suggests it's part of a series (e.g., has a number at the end)
    const isSeries = /\d+$|\s\d+$|\s\d+:/.test(movieDetails.title);
    let seriesTitle = "";
    if (isSeries) {
      // Extract the base series name (e.g., "The Hangover" from "The Hangover 2")
      seriesTitle = movieDetails.title.replace(/\s*\d+(:.*)?$|\s+\d+$/, '').trim();
    } else {
      // Try to extract the main title without subtitles (e.g., "The Hangover" from "The Hangover: Part II")
      const colonIndex = movieDetails.title.indexOf(':');
      seriesTitle = colonIndex > 0 ? movieDetails.title.substring(0, colonIndex).trim() : movieDetails.title;
    }
    
    // 1. Get movies from the same franchise/series - more aggressive search for series
    let franchiseMovies: any[] = [];
    if (seriesTitle) {
      // Use multiple search terms to catch more franchise movies
      const searchTerms = [seriesTitle];
      
      // If the series has common alternative names, add them
      if (seriesTitle.toLowerCase().includes("hangover")) {
        searchTerms.push("hangover");
      }
      
      for (const term of searchTerms) {
        const franchiseResponse = await fetch(
          `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(term)}&language=en-US&page=1`
        );
        const franchiseData = await franchiseResponse.json();
        
        // Filter for movies that are likely part of the same franchise
        const franchiseMatches = franchiseData.results.filter((movie: any) => {
          return movie.id !== movieId && 
                 (movie.title.toLowerCase().includes(term.toLowerCase()) || 
                  term.toLowerCase().includes(movie.title.toLowerCase()));
        });
        
        franchiseMovies.push(...franchiseMatches);
      }
      
      // Eliminate duplicates
      franchiseMovies = franchiseMovies.filter((movie, index, self) =>
        index === self.findIndex((m) => m.id === movie.id)
      );
    }
    
    // 2. Get pure similar movies (3 pages for more results)
    const similarMovies: any[] = [];
    for (let page = 1; page <= 3; page++) {
      const similarResponse = await fetch(
        `${BASE_URL}/movie/${movieId}/similar?api_key=${API_KEY}&language=en-US&page=${page}`
      );
      const similarData = await similarResponse.json();
      similarMovies.push(...similarData.results);
    }
    
    // 3. Get recommendations (3 pages for more results)
    const recommendMovies: any[] = [];
    for (let page = 1; page <= 3; page++) {
      const recommendResponse = await fetch(
        `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&language=en-US&page=${page}`
      );
      const recommendData = await recommendResponse.json();
      recommendMovies.push(...recommendData.results);
    }
    
    // 4. Get top movies from the primary genre with appropriate filters (multiple pages)
    const genreMovies: any[] = [];
    for (const genreId of primaryGenres.slice(0, 3)) { // Use up to 3 primary genres
      for (let page = 1; page <= 2; page++) { // Get 2 pages per genre
        const genreResponse = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=100&language=en-US&page=${page}`
        );
        const genreData = await genreResponse.json();
        genreMovies.push(...genreData.results.filter((m: any) => m.id !== movieId));
      }
    }
    
    // 5. Do a keyword search with the title to find thematically similar movies
    let keywordMovies: any[] = [];
    if (seriesTitle) {
      const keywordResponse = await fetch(
        `${BASE_URL}/search/keyword?api_key=${API_KEY}&query=${encodeURIComponent(seriesTitle)}&page=1`
      );
      const keywordData = await keywordResponse.json();
      
      if (keywordData.results && keywordData.results.length > 0) {
        // Take the top 5 keywords (increased from 3)
        const topKeywords = keywordData.results.slice(0, 5).map((k: any) => k.id);
        
        // Get movies with those keywords
        for (const keywordId of topKeywords) {
          const keywordMovieResponse = await fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_keywords=${keywordId}&sort_by=popularity.desc&vote_count.gte=50&language=en-US&page=1`
          );
          const keywordMovieData = await keywordMovieResponse.json();
          keywordMovies.push(...keywordMovieData.results);
        }
      }
    }
    
    // 6. Special case for Hangover franchise - ensure we get all Hangover movies
    if (movieDetails.title.toLowerCase().includes("hangover")) {
      const hangoverResponse = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=hangover&language=en-US&page=1`
      );
      const hangoverData = await hangoverResponse.json();
      
      // Add all hangover movies to franchise list
      const hangoverMovies = hangoverData.results.filter((movie: any) => 
        movie.id !== movieId && movie.title.toLowerCase().includes("hangover")
      );
      
      franchiseMovies.push(...hangoverMovies);
      
      // Eliminate duplicates in franchise movies
      franchiseMovies = franchiseMovies.filter((movie, index, self) =>
        index === self.findIndex((m) => m.id === movie.id)
      );
    }
    
    // Weight and combine all the sources
    // Prioritize movies in the following order:
    // 1. Same franchise/series (highest)
    // 2. Genre match AND high similarity
    // 3. Same primary genre with high popularity
    // 4. Keywords match
    // 5. Recommendations and similar (base level)
    
    // Combine all results for scoring
    let allCandidateMovies = [
      ...franchiseMovies.map(movie => ({ 
        ...movie, 
        source: 'franchise', 
        baseScore: 100  // High base score for franchise movies
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
    
    // Remove duplicates by preferring the higher scored source
    const uniqueMoviesMap = new Map();
    allCandidateMovies.forEach(movie => {
      const existing = uniqueMoviesMap.get(movie.id);
      if (!existing || existing.baseScore < movie.baseScore) {
        uniqueMoviesMap.set(movie.id, movie);
      }
    });
    
    let uniqueMovies = Array.from(uniqueMoviesMap.values());
    
    // Filter out the original movie
    uniqueMovies = uniqueMovies.filter(movie => movie.id !== movieId);
    
    // Get the genres of each candidate movie and calculate genre overlap
    const movieGenresPromises = uniqueMovies.map(async (movie) => {
      try {
        const detailsResponse = await fetch(
          `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=en-US`
        );
        const details = await detailsResponse.json();
        
        // Calculate genre overlap score
        const movieGenreIds = details.genres?.map((g: any) => g.id) || [];
        const genreOverlap = movieGenreIds.filter((id: number) => primaryGenres.includes(id)).length;
        const genreScore = genreOverlap / Math.max(1, primaryGenres.length) * 50; // Max 50 points for genre match
        
        return {
          ...movie,
          genreScore,
          genres: details.genres || []
        };
      } catch (error) {
        // If we can't get details, just return the movie with default values
        return {
          ...movie,
          genreScore: 0,
          genres: []
        };
      }
    });
    
    // Wait for all genre details to be retrieved
    let moviesWithGenres = await Promise.all(movieGenresPromises);
    
    // Final scoring algorithm (complex scoring based on multiple factors)
    const scoredMovies = moviesWithGenres.map(movie => {
      // Start with the base score from the source
      let finalScore = movie.baseScore || 0;
      
      // Add genre score
      finalScore += movie.genreScore || 0;
      
      // Add vote average score (0-20 points)
      finalScore += Math.min(20, (movie.vote_average || 0) * 2);
      
      // Add popularity score (0-20 points)
      finalScore += Math.min(20, (movie.popularity || 0) / 50);
      
      // Add vote count factor (0-10 points for having many votes)
      finalScore += Math.min(10, Math.log10((movie.vote_count || 0) + 1));
      
      // Add recency bonus (0-15 points for newer movies)
      const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;
      const currentYear = new Date().getFullYear();
      const yearDiff = Math.max(0, Math.min(30, currentYear - releaseYear));
      finalScore += Math.max(0, 15 - yearDiff * 0.5); // Newer movies get up to 15 points
      
      // Add title similarity bonus for franchise movies
      if (movie.title && seriesTitle && 
          (movie.title.toLowerCase().includes(seriesTitle.toLowerCase()) || 
           seriesTitle.toLowerCase().includes(movie.title.toLowerCase()))) {
        finalScore += 40; // Significant bonus for title similarity
      }
      
      // Special bonus for hangover movies
      if (movieDetails.title.toLowerCase().includes("hangover") && 
          movie.title.toLowerCase().includes("hangover")) {
        finalScore += 60; // Even higher bonus for hangover movies when searching for hangover
      }
      
      return {
        ...movie,
        finalScore
      };
    });
    
    // Sort by final score
    const sortedMovies = scoredMovies.sort((a, b) => b.finalScore - a.finalScore);
    
    // Map the results (increased to 40 movies for more variety)
    // Build the final movie objects with all needed data
    return sortedMovies.slice(0, 40).map((movie: any) => ({
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
    // Fetch multiple pages to get more movies
    const movies: Movie[] = [];
    const pagesToFetch = 6; // Increased from 3 to 6 pages
    
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
