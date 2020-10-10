import React, { FC, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Modal, Button, TextField, Typography } from '@material-ui/core';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { AccountPage } from './AccountPage';
import { DataState } from './DataState';
import { Posts } from './Posts';
import { ImageUpload } from './ImageUpload';
import { Pad, Columns, Rows } from './style';
import { db, auth } from './firebase';
import { Post, User } from './interfaces';
import { useUser } from './hooks';

const AppContainer = styled.div`
  padding-bottom: ${Pad.Large};
`;

const Header = styled(Rows)`
  width: 100vw;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: ${Pad.Medium};
  border-bottom: 1px solid lightgray;
  position: sticky;
  z-index: 10;
  top: 0;
`;

const Logo = styled.img.attrs(() => ({
  src:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Instagram_logo.svg/320px-Instagram_logo.svg.png',
  alt: 'Instagram',
}))`
  width: 120px;
  object-fit: contain;
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

const ModalFormContainer = styled(Columns).attrs(() => ({
  pad: Pad.Medium,
}))`
  padding: ${Pad.Large} 0;
`;

const BodyContainer = styled(Columns)`
  max-width: 500px;
  margin: 0 auto;
`;

export const App: FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [openSignUpModal, setOpenSignUpModal] = useState(false);
  const [openSignInModal, setOpenSignInModal] = useState(false);

  const [posts, setPosts] = useState<DataState<Post[]>>([]);

  const [user, setUser] = useUser();

  const signUp = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      auth
        .createUserWithEmailAndPassword(email, password)
        .then(async ({ user }) => {
          if (user) {
            const entry: User = {
              username,
              email,
            };
            db.collection('users').add(entry);
            // `await` may be unnecessary, see updateProfile docs
            await user.updateProfile({ displayName: username });
            setUser(user);
          }
          setEmail('');
          setPassword('');
        })
        .catch(error => alert(error.message));
      setOpenSignUpModal(false);
    },
    [email, password, username, setUser]
  );

  const signIn = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.preventDefault();
      auth
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          if (user) setUser(user);
          setEmail('');
          setPassword('');
        })
        .catch(error => alert(error.message));
      setOpenSignInModal(false);
    },
    [user, email, password, setUser]
  );

  useEffect(() => {
    return auth.onAuthStateChanged(user => {
      if (user && !user.displayName) {
        user.updateProfile({ displayName: username });
      }
    });
  }, [username]);

  useEffect(() => {
    return db
      .collection('posts')
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        ({ docs }) =>
          setPosts(
            docs.map(row => {
              const post = row.data();
              post.id = row.id;
              return post as Post;
            })
          ),
        error => setPosts(DataState.error(error.message))
      );
  }, []);

  return (
    <AppContainer>
      <Modal open={openSignInModal} onClose={() => setOpenSignInModal(false)}>
        <ModalContainer>
          <ModalFormContainer as="form">
            <TextField
              label="Email"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
            <Button variant="contained" onClick={signIn} color="primary">
              Sign In
            </Button>
          </ModalFormContainer>
        </ModalContainer>
      </Modal>
      <Modal open={openSignUpModal} onClose={() => setOpenSignUpModal(false)}>
        <ModalContainer>
          <ModalFormContainer as="form">
            <TextField
              label="Username"
              value={username}
              onChange={event => setUsername(event.target.value)}
            />
            <TextField
              label="Email"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
            <TextField
              type="Password"
              label="Password"
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
            <Button variant="contained" onClick={signUp} color="primary">
              Sign Up
            </Button>
          </ModalFormContainer>
        </ModalContainer>
      </Modal>
      <Header>
        <Logo />
        {user?.displayName ? (
          <Rows pad={Pad.Medium}>
            <Typography variant="body2" style={{ alignSelf: 'center' }}>
              {user.displayName}
            </Typography>
            <Button variant="outlined" onClick={() => auth.signOut()}>
              Sign Out
            </Button>
          </Rows>
        ) : (
          <Rows pad={Pad.Medium}>
            <Button
              variant="outlined"
              onClick={() => setOpenSignInModal(true)}
              color="primary"
            >
              Sign In
            </Button>
            <Button variant="outlined" onClick={() => setOpenSignUpModal(true)}>
              Sign Up
            </Button>
          </Rows>
        )}
      </Header>
      <BodyContainer pad={Pad.Large}>
        <Router>
          <Switch>
            <Route exact path="/">
              {user?.displayName ? (
                <ImageUpload />
              ) : (
                <Button disabled style={{ margin: Pad.Large }}>
                  Sign in to upload
                </Button>
              )}
              <Posts posts={posts} />
            </Route>
            <Route path="/:username">
              <AccountPage />
            </Route>
          </Switch>
        </Router>
      </BodyContainer>
    </AppContainer>
  );
};
