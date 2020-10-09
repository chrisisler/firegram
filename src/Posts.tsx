import React, { FC, useEffect, useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import {
  Avatar,
  Button,
  IconButton,
  Link as MuiLink,
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
}))`
  font-size: 0.9em;
  box-sizing: content-box;
  width: 100%;
  padding: ${Pad.Medium};
  border: none;
`;

const CommentContainer = styled(Columns).attrs(() => ({
  between: true,
}))`
  margin-right: ${Pad.Small};

  & > *:not(:first-child) {
    margin-left: ${Pad.Medium};
  }
`;

/** Trim and append ellipsis to a given string if it exceeds some limit. */
const truncate = (limit: number, str: string): string =>
  str?.length > limit ? str?.substr(0, limit - 1) + '...' : str;

/** Presentational component. Renders IG-style text. */
const UserTextView: FC<{
  username: string;
  text: string;
  large?: boolean;
}> = ({ username, text, large }) => (
  <Caption large={large}>
    <Link
      to={`/${username}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <strong>{username}</strong>
    </Link>
    &nbsp;&nbsp;
    {text}
  </Caption>
);

const CommentView: FC<{
  comment: Comment;
  deletable: boolean;
  reply: () => void;
  // This is an awkward way to handle fetching db rows
  repliesQuery: firestore.Query;
  deleteComment: () => void;
  deleteReply: (replyId: string) => void;
}> = ({
  comment,
  deletable,
  reply,
  deleteComment,
  deleteReply,
  repliesQuery,
}) => {
  const [replies, setReplies] = useState<
    // TODO Remove `id`
    DataState<{ id: string; reply: Comment }[]>
  >(DataState.Empty);

  useEffect(() => {
    return repliesQuery.onSnapshot(
      ({ docs }) =>
        setReplies(
          docs.map(row => ({
            // TODO Remove `id`
            id: row.id,
            reply: row.data() as Comment,
          }))
        ),
      error => setReplies(DataState.error(error.message))
    );
  }, [repliesQuery]);

  return (
    <CommentContainer>
      <Rows between>
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
      </Rows>
      <Typography variant="subtitle2" color="textSecondary">
        <MuiLink
          onClick={reply}
          style={{
            marginLeft: Pad.Large,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          Reply
        </MuiLink>
      </Typography>
      {DataState.isReady(replies) && (
        <Columns>
          {replies.map(({ id, reply }) => (
            <Rows between key={id}>
              <UserTextView username={reply.username} text={reply.text} />
              {auth.currentUser?.displayName &&
                (auth.currentUser.displayName === reply.username ||
                  auth.currentUser.displayName === comment.username) && (
                  <IconButton
                    size="small"
                    edge="end"
                    aria-label="Delete Reply"
                    onClick={() => deleteReply(id)}
                  >
                    <DeleteOutlinedIcon />
                  </IconButton>
                )}
            </Rows>
          ))}
        </Columns>
      )}
    </CommentContainer>
  );
};

/**
 * Presentational component. Renders the core image content with a header and
 * comments below.
 */
const PostView: FC<{
  id: string;
  post: Post;
}> = ({ id, post }) => {
  const commentRef = useRef<HTMLInputElement>(null);
  const [comment, setComment] = useState('');

  const [comments, setComments] = useState<DataState<Comment[]>>(
    DataState.Loading
  );
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  const addComment = useCallback(
    <E extends React.SyntheticEvent>(event: E) => {
      event.preventDefault();
      if (!auth.currentUser?.displayName) return;
      if (!commentRef.current || !commentRef.current.value) return;
      const entry: Comment = {
        id: '',
        text: commentRef.current.value.trim(),
        username: auth.currentUser.displayName,
        timestamp: firestore.FieldValue.serverTimestamp(),
      };
      if (replyingTo) {
        db.collection('posts')
          .doc(id)
          .collection('comments')
          .doc(replyingTo.id)
          .collection('replies')
          .add(entry);
      } else {
        db.collection('posts').doc(id).collection('comments').add(entry);
      }
      setComment('');
    },
    [id, replyingTo]
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
        ({ docs }) =>
          setComments(
            docs.map(row => {
              const comment = row.data();
              comment.id = row.id;
              return comment as Comment;
            })
          ),
        error => setComments(DataState.error(error.message))
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
            {comments.map(comment => {
              const userAuthoredPostOrComment =
                !!auth.currentUser?.displayName &&
                (auth.currentUser.displayName === comment.username ||
                  auth.currentUser.displayName === post.username);
              const commentDocument = db
                .collection('posts')
                .doc(id)
                .collection('comments')
                .doc(comment.id);
              return (
                <CommentView
                  key={comment.id}
                  comment={comment}
                  reply={() => {
                    if (commentRef.current) commentRef.current.value = '';
                    setReplyingTo(comment);
                    commentRef.current?.focus();
                  }}
                  deletable={userAuthoredPostOrComment}
                  repliesQuery={commentDocument
                    .collection('replies')
                    .orderBy('timestamp', 'desc')}
                  deleteComment={() => {
                    if (!userAuthoredPostOrComment) return;
                    commentDocument.delete();
                    setReplyingTo(null);
                  }}
                  deleteReply={(replyId: string) => {
                    commentDocument.collection('replies').doc(replyId).delete();
                    setReplyingTo(null);
                  }}
                />
              );
            })}
          </Columns>
        )}
      </DataStateView>
      {!!auth.currentUser && (
        <AddCommentContainer as="form" onSubmit={addComment}>
          <CommentInput
            ref={commentRef}
            value={comment}
            onChange={event => setComment(event.target.value)}
            placeholder={
              !!replyingTo
                ? `Reply to ${replyingTo.username}: ${truncate(
                    6,
                    replyingTo.text
                  )}`
                : 'Add a comment...'
            }
          />
          {comment.length > 0 && (
            <Button
              color="primary"
              style={{ margin: `0 ${Pad.Medium}` }}
              onClick={addComment}
            >
              {!!replyingTo ? 'Reply' : 'Comment'}
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
export const Posts: FC<{ posts: DataState<Post[]> }> = ({ posts }) => {
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
          {posts.map(p => (
            <PostView key={p.id} id={p.id} post={p} />
          ))}
        </>
      )}
    </DataStateView>
  );
};
