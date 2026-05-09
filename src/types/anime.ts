// Anime type definitions based on Jikan API v4 response structure

export type AnimeType = "tv" | "movie" | "ova" | "special" | "ona" | "music";
export type AnimeStatus = "airing" | "complete" | "upcoming";
export type Season = "winter" | "spring" | "summer" | "fall";

export interface Genre {
  mal_id: number;
  name: string;
  type: "anime" | "manga";
  url: string;
}

export interface Studio {
  mal_id: number;
  name: string;
  type: string;
  url: string;
}

export interface Producer {
  mal_id: number;
  name: string;
  type: string;
  url: string;
}

export interface Licensor {
  mal_id: number;
  name: string;
  type: string;
  url: string;
}

export interface Demographic {
  mal_id: number;
  name: string;
  type: string;
  url: string;
}

export interface Anime {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
  } | null;
  synopsis: string | null;
  type: AnimeType;
  episodes: number | null;
  status: AnimeStatus;
  airing: boolean;
  aired: {
    from: string | null;
    to: string | null;
    string: string;
  };
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  genres: Genre[];
  studios: Studio[];
  season: Season | null;
  year: number | null;
}

export interface Relation {
  relation: string;
  entry: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
}

export interface ExternalLink {
  name: string;
  url: string;
}

export interface StreamingLink {
  name: string;
  url: string;
}

export interface AnimeDetail extends Anime {
  title_synonyms: string[];
  source: string;
  duration: string;
  rating: string;
  background: string | null;
  broadcast: {
    day: string | null;
    time: string | null;
    timezone: string | null;
    string: string | null;
  } | null;
  producers: Producer[];
  licensors: Licensor[];
  demographics: Demographic[];
  relations: Relation[];
  theme: {
    openings: string[];
    endings: string[];
  };
  external: ExternalLink[];
  streaming: StreamingLink[];
}

export interface VoiceActor {
  mal_id: number;
  name: string;
  language: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
}

export interface Character {
  mal_id: number;
  name: string;
  images: {
    jpg: {
      image_url: string;
    };
    webp: {
      image_url: string;
    };
  };
  role: "Main" | "Supporting";
  voice_actors: VoiceActor[];
}
