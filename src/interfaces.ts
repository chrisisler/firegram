import { firestore } from 'firebase/app';

export interface Post {
  /** The author of the comment. */
  username: string;

  /** The author's initial comment on the post. */
  caption: string;

  /** The location of the image for the post. */
  imageUrl: string;

  /** The time the post was posted. */
  timestamp: firestore.FieldValue;
}

export interface Comment {
  /** The content of the comment. */
  text: string;

  /** The author of the comment. */
  username: string;

  /** The time the comment was posted. */
  timestamp: firestore.FieldValue;
}
