import React, { FC } from 'react';
import styled from 'styled-components';
import Avatar from '@material-ui/core/Avatar';

import { Pad, Rows } from './style';

const Container = styled.div`
  background-color: #fff;
  max-width: 500px;
  border: 1px solid lightgray;
`;

const Image = styled.img.attrs((props: { src?: string }) => ({
  src: props?.src ?? 'https://cdn-images-1.medium.com/max/1200/1*y6C4nSvy2Woe0m7bWEn4BA.png',
  alt: 'React JS',
}))`
  width: 100%;
  object-fit: contain;
  border-top: 1px solid lightgray;
  border-bottom: 1px solid lightgray;
`;

const Text = styled.p`
  padding: ${Pad.Medium};
`;

const Header = styled(Rows)`
  align-items: center;
  padding: ${Pad.Medium};
`;

export const Post: FC<{
  username: string;
  caption: string;
  imageUrl: string;
}> = ({ username, caption, imageUrl }) => {
  return (
    <Container>
      <Header>
        <Avatar src="/static/images/avatar/1.jpg" alt="A" />
        <h3>{username}</h3>
      </Header>
      <Image src={imageUrl} />
      <Text>
        <strong>{username}</strong>{caption}
      </Text>
    </Container>
  );
};
