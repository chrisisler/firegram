import React, { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Avatar, Typography } from '@material-ui/core';
import { useParams } from 'react-router-dom';

import { Posts } from './Posts';
import { Columns, Rows, Pad } from './style';
import { DataState, useDataState } from './DataState';
import { db } from './firebase';
import { Post } from './interfaces';

const Header = styled(Rows).attrs(() => ({
  pad: Pad.Large,
}))`
  padding: ${Pad.Medium};
  padding-top: ${Pad.Large};
`;

export const AccountPage: FC = () => {
  const { username } = useParams();

  /** Is there an account associated with the given username in the URL? */
  const [userExists] = useDataState(
    () =>
      db
        .collection('users')
        .where('username', '==', username)
        .get()
        .then(({ empty }) => !empty)
        .catch(() => DataState.error()),
    [username]
  );

  const [posts, setPosts] = useState<DataState<Post[]>>(DataState.Empty);

  useEffect(() => {
    if (!(DataState.isReady(userExists) && userExists)) return;
    return db
      .collection('posts')
      .where('username', '==', username)
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
  }, [username, userExists]);

  return (
    <>
      <Header>
        <Avatar
          src="/static/images/avatar/1.jpg"
          style={{ height: Pad.XLarge, width: Pad.XLarge }}
          alt={username[0]}
        />
        <Columns>
          <Typography variant="h5">{username}</Typography>
          {DataState.isReady(posts) && (
            <Typography variant="subtitle2" color="textSecondary">
              {posts.length} post{posts.length === 1 ? '' : 's'}
            </Typography>
          )}
        </Columns>
      </Header>
      <Posts posts={posts} />
    </>
  );
};
