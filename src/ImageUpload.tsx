import React, { useState, FC } from 'react';
import { TextField, Button, Input } from '@material-ui/core';
import styled from 'styled-components';

import { Columns, Pad } from './style';

const Container = styled.div`
  padding: ${Pad.Large};
  background-color: #fff;
`;

export const ImageUpload: FC = () => {
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  return (
    <Container>
      <Columns pad={Pad.Small}>
        <TextField
          variant="outlined"
          placeholder="Caption"
          size="small"
          value={caption}
          onChange={event => setCaption(event.target.value)}
        />
        <input
          type="file"
          onChange={event => {
            const file = event.target.files?.[0];
            if (file) setImage(file);
          }}
        />
        <Button variant="contained" color="primary" onClick={() => {}}>
          Upload
        </Button>
      </Columns>
    </Container>
  );
};
