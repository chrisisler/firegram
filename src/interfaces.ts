import { firestore } from 'firebase/app';

export interface Post {
  readonly id: string;

  /** The author of the comment. */
  readonly username: string;

  /** The author's initial comment on the post. */
  caption: string;

  /** The location of the image for the post. */
  imageUrl: string;

  /** The time the post was posted. */
  timestamp: firestore.FieldValue;
}

export interface Comment {
  readonly id: string;

  /** The content of the comment. */
  text: string;

  /** The author of the comment. */
  username: string;

  /** The time the comment was posted. */
  timestamp: firestore.FieldValue;
}

export interface User {
  /** The unique username for the account. */
  readonly username: string;

  /** The email of the account. */
  readonly email: string;
}
