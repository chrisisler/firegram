import React, { FC, useState } from 'react';
import styled from 'styled-components';

import { Post } from './Post';
import { Pad, Columns } from './style';

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
  const [posts, setPosts] = useState([
    {
      username: 'chris isler',
      caption: 'wow im the best',
      imageUrl:
        'https://cdn-images-1.medium.com/max/1200/1*y6C4nSvy2Woe0m7bWEn4BA.png',
    },
    {
      username: 'ryan isler',
      caption: 'caption 20 flakdjfalsdkfjalkdfj',
      imageUrl:
        'https://cdn-images-1.medium.com/max/1200/1*y6C4nSvy2Woe0m7bWEn4BA.png',
    },
  ]);
  return (
    <Container>
      <Header>
        <Logo />
      </Header>
      <Columns pad={Pad.Large}>
        {posts.map(post => (
          <Post
            key={post.caption}
            username={post.username}
            caption={post.caption}
            imageUrl={post.imageUrl}
          />
        ))}
      </Columns>
    </Container>
  );
};
