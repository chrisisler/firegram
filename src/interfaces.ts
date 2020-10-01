export interface Post {
  username: string;
  caption: string;
  imageUrl: string;
  timestamp: string;
  userId: string;
}

export interface Comment {
  text: string;
  username: string;
  timestamp: string;
  userId: string;
}
