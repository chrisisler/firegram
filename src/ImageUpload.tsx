import React, { useState, FC } from 'react';
import { TextField, Button, LinearProgress } from '@material-ui/core';
import styled from 'styled-components';
import { firestore } from 'firebase/app';

import { db, storage } from './firebase';
import { Columns, Pad } from './style';
import { Post } from './interfaces';

const Container = styled.div`
  padding: ${Pad.Large};
  background-color: #fff;
  border-bottom: 1px solid lightgray;
`;

export const ImageUpload: FC<{ username: string; userId?: string }> = ({
  username,
  userId,
}) => {
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const upload = () => {
    if (!imageFile) return;
    const uploading = storage.ref(`images/${imageFile.name}`).put(imageFile);
    uploading.on(
      'state_changed',
      ({ bytesTransferred, totalBytes }) => {
        setProgress((bytesTransferred / totalBytes) * 100);
      },
      error => {
        console.error(error);
        alert(error.message);
      },
      () => {
        storage
          .ref('images') // Skip the child() ??? .ref(`images/${imageFile.name}`)
          .child(imageFile.name)
          .getDownloadURL()
          .then(imageUrl => {
            db.collection('posts').add({
              timestamp: firestore.FieldValue.serverTimestamp(),
              caption: caption.trim(),
              userId,
              imageUrl,
              username,
            } as Post);
            setProgress(0);
            setCaption('');
            setImageFile(null);
          });
      }
    );
  };

  return (
    <Container>
      <Columns pad={Pad.Small}>
        <input
          type="file"
          onChange={({ target: { files } }) => {
            if (files) setImageFile(files[0]);
          }}
        />
        <TextField
          variant="outlined"
          placeholder="Caption"
          size="small"
          value={caption}
          onChange={event => setCaption(event.target.value)}
        />
        <Button variant="text" color="primary" onClick={upload}>
          {progress !== 0 ? `${Math.round(progress)}%` : 'Upload'}
        </Button>
        {progress !== 0 && (
          <LinearProgress variant="determinate" value={progress} />
        )}
      </Columns>
    </Container>
  );
};
