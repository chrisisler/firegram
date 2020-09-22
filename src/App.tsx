import React, { FC, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Modal, Button, TextField } from '@material-ui/core';

import { Post } from './Post';
import { ImageUpload } from './ImageUpload';
import { Pad, Columns, Rows } from './style';
import { db, auth } from './firebase';
import { PostData } from './interfaces';

const AppContainer = styled.div`
  /* width: 100%;
  margin: 0 auto; */
`;

const Header = styled(Rows)`
  justify-content: space-between;
  background-color: #fff;
  padding: ${Pad.Medium};
  border-bottom: 1px solid lightgray;
  object-fit: contain;
`;

const Logo = styled.img.attrs(() => ({
  src:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/320px-Instagram_logo.svg.png',
  alt: 'Instagram',
}))`
  width: 120px;
`;

const ModalContainer = styled.div`
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
  background-color: #fafafa;
  width: 400px;
  border: none;
  box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.3);
  padding: ${Pad.Medium} ${Pad.Large};
`;

const ContentContainer = styled(Columns)`
  max-width: 500px;
  width: 500px;
  margin: 0 auto;
`;

export const App: FC = () => {
  // Modal and input states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [openSignUpModal, setOpenSignUpModal] = useState(false);
  const [openSignInModal, setOpenSignInModal] = useState(false);

  // Authenticated user and loaded content
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState<{ id: string; post: PostData }[]>([]);

  const signUp = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      auth
        .createUserWithEmailAndPassword(email, password)
        .then(({ user }) => user?.updateProfile({ displayName: username }))
        .catch(error => alert(error.message));
      setOpenSignUpModal(false);
    },
    [email, password, username]
  );

  const signIn = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      auth
        .signInWithEmailAndPassword(email, password)
        .catch(error => alert(error.message));
      setOpenSignInModal(false);
    },
    [email, password]
  );

  // Connect UI state to user sign in/out changes
  useEffect(() => {
    return auth.onAuthStateChanged(user => {
      if (!user) return setUser(null);
      if (!user.displayName) {
        return user.updateProfile({ displayName: username });
      }
    });
  }, [user, username]);

  // Fetch posts from DB and subscribe to DB updates to posts
  useEffect(() => {
    return db.collection('posts').onSnapshot(snapshot => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        post: doc.data() as PostData,
      }));
      setPosts(posts);
    });
  }, []);

  return (
    <AppContainer>
      <Modal open={openSignInModal} onClose={() => setOpenSignInModal(false)}>
        <ModalContainer>
          <form>
            <Columns pad={Pad.Medium} style={{ margin: `${Pad.Large} 0` }}>
              <TextField
                placeholder="Email"
                value={email}
                onChange={event => setEmail(event.target.value)}
              />
              <TextField
                type="Password"
                placeholder="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
              <Button variant="outlined" onClick={signIn}>
                Sign In
              </Button>
            </Columns>
          </form>
        </ModalContainer>
      </Modal>
      <Modal open={openSignUpModal} onClose={() => setOpenSignUpModal(false)}>
        <ModalContainer>
          <form>
            <Columns pad={Pad.Medium} style={{ margin: `${Pad.Large} 0` }}>
              <TextField
                placeholder="Username"
                value={username}
                onChange={event => setUsername(event.target.value)}
              />
              <TextField
                placeholder="Email"
                value={email}
                onChange={event => setEmail(event.target.value)}
              />
              <TextField
                type="Password"
                placeholder="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
              <Button variant="outlined" onClick={signUp}>
                Sign Up
              </Button>
            </Columns>
          </form>
        </ModalContainer>
      </Modal>
      <Header>
        <Logo />
        {user ? (
          <Button variant="outlined" onClick={() => auth.signOut()}>
            Log Out
          </Button>
        ) : (
          <Rows pad={Pad.Medium}>
            <Button variant="outlined" onClick={() => setOpenSignInModal(true)}>
              Sign In
            </Button>
            <Button variant="outlined" onClick={() => setOpenSignUpModal(true)}>
              Sign Up
            </Button>
          </Rows>
        )}
      </Header>
      <ContentContainer pad={Pad.Large}>
        <ImageUpload />
        {posts.map(({ post, id }) => (
          <Post
            key={id}
            username={post.username}
            caption={post.caption}
            imageUrl={post.imageUrl}
          />
        ))}
      </ContentContainer>
    </AppContainer>
  );
};
