import React, { FC, useState, useEffect } from 'react';
import styled from 'styled-components';

import { Post } from './Post';
import { Pad, Columns } from './style';
import { db } from './firebase';
import { PostData } from './interfaces';

const Container = styled.div``;

const Header = styled.div`
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

export const App: FC = () => {
  const [posts, setPosts] = useState<{ id: string; post: PostData }[]>([]);

  useEffect(() => {
    const unsubscribe = db.collection('posts').onSnapshot(snapshot => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        post: doc.data() as PostData,
      }));
      setPosts(posts);
    });
    return unsubscribe;
  }, []);

  return (
    <Container>
      <Header>
        <Logo />
      </Header>
      <Columns pad={Pad.Large}>
        {posts.map(({ post, id }) => (
          <Post
            key={id}
            username={post.username}
            caption={post.caption}
            imageUrl={post.imageUrl}
          />
        ))}
      </Columns>
    </Container>
  );
};
