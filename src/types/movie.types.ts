
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
  director?: string;
  director_id?: number;
  score?: number;
  // Adding new properties used in the recommendation service
  source?: string;
  similarityScore?: number;
  matchReason?: string[];
}

export interface Genre {
  id: number;
  name: string;
}
