import React, { FC, useEffect, useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import {
  Avatar,
  Button,
  IconButton,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import { firestore } from 'firebase/app';
import DeleteOutlinedIcon from '@material-ui/icons/Delete';
import { Link } from 'react-router-dom';

import { Pad, Rows, Columns } from './style';
import { auth, db } from './firebase';
import { DataState, DataStateView } from './DataState';
import { Post, Comment } from './interfaces';

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

const CommentContainer = styled(Rows)`
  justify-content: space-between;
  margin-right: ${Pad.Small};
`;

/** Presentational component. Renders IG-style text. */
const UserTextView: FC<{
  username: string;
  text: string;
  large?: boolean;
}> = ({ username, text, large }) => (
  <Caption large={large}>
    <strong>{username}</strong>&nbsp;&nbsp;
    {text}
  </Caption>
);

/**
 * Presentational component. Displays a comment preceeded by the author name.
 * Conditionally renders a delete button.
 */
const CommentView: FC<{
  comment: Comment;
  deletable: boolean;
  deleteComment: () => void;
}> = ({ deletable, comment, deleteComment }) => (
  <CommentContainer>
    <UserTextView
      username={comment.username}
      text={comment.text}
      key={comment.timestamp + ''}
    />
    {deletable && (
      <IconButton
        size="small"
        edge="end"
        aria-label="Delete Comment"
        onClick={deleteComment}
      >
        <DeleteOutlinedIcon />
      </IconButton>
    )}
  </CommentContainer>
);

/**
 * Presentational component. Renders the core image content with a header and
 * comments below.
 */
const PostView: FC<{
  id: string;
  post: Post;
}> = ({ id, post }) => {
  /** The state of comment data for this post, fetched from firebase. */
  const [comments, setComments] = useState<
    DataState<{ id: string; comment: Comment }[]>
  >(DataState.Loading);

  /** Controlled input. */
  const [comment, setComment] = useState('');

  /** Is the user actively editing the input? */
  const commenting = useMemo(() => comment.length > 0, [comment]);

  const addComment = useCallback(
    <E extends React.SyntheticEvent>(event: E) => {
      event.preventDefault();
      db.collection('posts')
        .doc(id)
        .collection('comments')
        .add({
          text: comment,
          username: auth.currentUser?.displayName,
          timestamp: firestore.FieldValue.serverTimestamp(),
        } as Comment);
      setComment('');
    },
    [id, comment]
  );

  /** Subscribe to updates to the comments collection for UI updates. */
  useEffect(() => {
    if (!id) return;
    return db
      .collection('posts')
      .doc(id)
      .collection('comments')
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        ({ docs }) => {
          setComments(
            docs.map(doc => ({
              id: doc.id,
              comment: doc.data() as Comment,
            }))
          );
        },
        error => {
          setComments(DataState.error(error.message));
        }
      );
  }, [id]);

  return (
    <Container>
      <Header pad={Pad.Small} center>
        <Avatar src="/static/images/avatar/1.jpg" alt={post.username[0]} />
        <Typography variant="h6" color="textPrimary">
          <Link
            to={`/${post.username}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {post.username}
          </Link>
        </Typography>
      </Header>
      <Image src={post.imageUrl} />
      <UserTextView large username={post.username} text={post.caption} />
      <DataStateView
        data={comments}
        loading={() => (
          <Columns pad={Pad.Medium} center>
            <CircularProgress />
          </Columns>
        )}
        error={() => (
          <Columns pad={Pad.Medium} center>
            <Typography variant="h6" color="error">
              Could not load comments.
            </Typography>
          </Columns>
        )}
      >
        {comments => (
          <Columns padding={`0 0 ${Pad.Small}`}>
            {comments.map(({ comment, id: commentId }) => {
              const userAuthoredPostOrComment =
                !!auth.currentUser?.displayName &&
                (auth.currentUser.displayName === comment.username ||
                  auth.currentUser.displayName === post.username);
              return (
                <CommentView
                  key={commentId}
                  comment={comment}
                  deletable={userAuthoredPostOrComment}
                  deleteComment={() => {
                    if (!userAuthoredPostOrComment) return;
                    db.collection('posts')
                      .doc(id)
                      .collection('comments')
                      .doc(commentId)
                      .delete();
                  }}
                />
              );
            })}
          </Columns>
        )}
      </DataStateView>
      {!!auth.currentUser && (
        <AddCommentContainer as="form" onSubmit={addComment}>
          <CommentInput onChange={event => setComment(event.target.value)} />
          {commenting && (
            <Button color="primary" style={{ margin: `0 ${Pad.Medium}` }}>
              Comment
            </Button>
          )}
        </AddCommentContainer>
      )}
    </Container>
  );
};

/**
 * Presentational Component. Renders a column of IG-style posts, with an
 * appropriate UI if the posts are loading or failed to load.
 */
export const Posts: FC<{
  posts: DataState<{ id: string; post: Post }[]>;
}> = ({ posts }) => {
  return (
    <DataStateView
      data={posts}
      loading={() => (
        <Columns pad={Pad.Medium} center>
          <CircularProgress />
        </Columns>
      )}
      error={() => (
        <Columns pad={Pad.Medium} center>
          <Typography variant="h5" color="error">
            Sorry! Something went wrong.
          </Typography>
        </Columns>
      )}
    >
      {posts => (
        <>
          {posts.map(({ post, id }) => (
            <PostView key={id} id={id} post={post} />
          ))}
        </>
      )}
    </DataStateView>
  );
};
