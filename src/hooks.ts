import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/app';

import { auth } from './firebase';

/**
 * Get the currently logged-in user, if it exists.
 * This is the preferred method over `auth.currentUser`.
 * If using `user` to conditionally render UI, use `user && foo` over
 * `user?.displayName && foo`.
 */
export const useUser = (): [
  FirebaseUser | null,
  React.Dispatch<React.SetStateAction<FirebaseUser | null>>
] => {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    return auth.onAuthStateChanged(user => {
      // `user` could be `firebase.User` instance (when a client authenticates)
      // or `null` (when a client de-authenticates)
      setUser(user);
    });
  }, []);

  return [user, setUser];
};
