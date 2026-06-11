export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  city?: string;
  specialty?: string;
  socials: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface Article {
  id: string;
  title: string;
  description: string;
  body: string[]; // Content paragraphs
  cover: string;
  category: string;
  author: Author;
  date: string;
  readTime: string;
  trending?: boolean;
  featured?: boolean;
  likes: number;
}

export interface Comment {
  id: string;
  articleId: string; // "general" or specific article id
  author: string;
  body: string;
  timestamp: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  audioUrl: string; // Fallback or mocked audio streaming
  duration: string;
  date: string;
  episodeNumber: number;
}

export interface Discussion {
  id: string;
  title: string;
  author: string;
  category: string;
  votes: number;
  replies: number;
  timeAgo: string;
}
