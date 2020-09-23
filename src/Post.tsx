import React, { FC, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { Avatar, Button } from '@material-ui/core';
import { User, firestore } from 'firebase/app';

import { Pad, Rows, Columns } from './style';
import { db } from './firebase';
import { DataState, DataStateView } from './DataState';
import { PostData, Comment } from './interfaces';

const Container = styled.div`
  background-color: #fff;
  width: 100%;
  border: 1px solid lightgray;
`;

const Image = styled.img.attrs((props: { src: string }) => ({
  src: props.src,
  alt: '',
}))`
  width: 100%;
  object-fit: contain;
  border-top: 1px solid lightgray;
  border-bottom: 1px solid lightgray;
`;

// prettier-ignore
const Caption = styled.p`
  padding: ${(props: { large?: boolean }) => props.large ? Pad.Medium : Pad.XSmall} ${Pad.Medium};
`;

const Header = styled(Rows)`
  padding: ${Pad.Medium};
`;

const AddCommentContainer = styled(Rows)`
  width: 100%;
  border-top: 1px solid lightgray;
`;

const CommentInput = styled.input.attrs(() => ({
  type: 'text',
  placeholder: 'Add a comment...',
}))`
  font-size: 0.9em;
  box-sizing: content-box;
  width: 100%;
  padding: ${Pad.Medium};
  border: none;
`;

const UserTextView: FC<{ username: string; text: string; large?: boolean }> = ({
  username,
  text,
  large,
}) => (
  <Caption large={large}>
    <strong>{username}</strong>&nbsp;&nbsp;
    {text}
  </Caption>
);

export const Post: FC<{
  postId: string;
  postData: PostData;
  user: User | null;
}> = ({ postId, user, postData: { username, caption, imageUrl } }) => {
  const [comments, setComments] = useState<DataState<Comment[]>>(
    DataState.Loading
  );
  const [comment, setComment] = useState('');

  const commenting = useMemo(() => comment.length > 0, [comment]);

  useEffect(() => {
    if (!postId) return;
    return db
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        ({ docs }) => {
          const comments = docs.map(d => d.data() as Comment);
          setComments(comments);
        },
        error => {
          setComments(DataState.error(error.message));
        }
      );
  }, [postId]);

  const addComment = <E extends React.SyntheticEvent>(event: E) => {
    event.preventDefault();
    db.collection('posts').doc(postId).collection('comments').add({
      text: comment,
      username: user?.displayName,
      timestamp: firestore.FieldValue.serverTimestamp(),
    });
    setComment('');
  };

  return (
    <Container>
      <Header pad={Pad.Small} center>
        <Avatar
          src="/static/images/avatar/1.jpg"
          alt={username[0].toUpperCase()}
        />
        <h3>{username}</h3>
      </Header>
      <Image src={imageUrl} />
      <UserTextView large username={username} text={caption} />
      <DataStateView
        data={comments}
        loading={() => <UserTextView username="loading comments" text="" />}
        error={() => (
          <UserTextView username="could not load comments" text="" />
        )}
      >
        {comments => (
          <Columns padding={`0 0 ${Pad.Small}`}>
            {comments.map(({ text, username, timestamp }) => (
              <UserTextView username={username} text={text} key={timestamp} />
            ))}
          </Columns>
        )}
      </DataStateView>
      {!!user && (
        <AddCommentContainer as="form" onSubmit={addComment}>
          <CommentInput onChange={event => setComment(event.target.value)} />
          {commenting && (
            <Button
              onClick={addComment}
              color="primary"
              style={{ margin: `0 ${Pad.Medium}` }}
            >
              Comment
            </Button>
          )}
        </AddCommentContainer>
      )}
    </Container>
  );
};
