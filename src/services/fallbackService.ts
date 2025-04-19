import { Movie } from '@/types/movie.types';

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
