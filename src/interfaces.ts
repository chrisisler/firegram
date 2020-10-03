import { firestore } from 'firebase/app';

export interface Post {
  username: string;
  caption: string;
  imageUrl: string;
  timestamp: firestore.FieldValue;
  userId: string;
}

export interface Comment {
  text: string;
  username: string;
  timestamp: firestore.FieldValue;
  userId: string;
}
