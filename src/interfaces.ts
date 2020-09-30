export interface Post {
  username: string;
  caption: string;
  imageUrl: string;
  timestamp: string;
}

export interface Comment {
  text: string;
  username: string;
  timestamp: string;
}
