import React, { useState } from 'react';
import { authenticatedFetch } from '../api/auth';

const PostCard = ({ initialPost }) => {
  const [post, setPost] = useState(initialPost);
  const [commentText, setCommentText] = useState('');

  // --- LIKE/UNLIKE LOGIC ---
  const handleLike = async () => {
    try {
      const { liked } = await authenticatedFetch(`/posts/${post._id}/like`, 'post');
      
      // Update state immediately (Requirement: Update UI without page refresh)
      setPost(prevPost => ({
        ...prevPost,
        isLiked: liked,
        likesCount: prevPost.likesCount + (liked ? 1 : -1)
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  // --- COMMENT LOGIC ---
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      // NOTE: This assumes the comment endpoint returns the full comment including user data
      // In a full app, you might fetch all comments after submitting, or rely on a Post Detail view.
      
      const newComment = await authenticatedFetch(`/posts/${post._id}/comment`, 'post', { text: commentText });
      
      // Clear input and show a success message or update a local comment list (optional)
      setCommentText('');
      console.log("Comment posted:", newComment);
      
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const likeButtonClass = post.isLiked ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="border rounded-lg shadow-md mb-8 w-96 mx-auto">
      <div className="p-3 font-semibold">{post.userId.username}</div>
      <img src={post.imageUrl} alt="Post" className="w-full h-auto object-cover" />
      <div className="p-3">
        {/* Like Button */}
        <button onClick={handleLike} className={`mr-4 ${likeButtonClass}`}>
          ❤️ ({post.likesCount})
        </button>
        {/* Comment Link (links to Post Detail) */}
        <a href={`/post/${post._id}`} className="text-gray-500">
          💬 ({post.commentsCount})
        </a>
      </div>
      
      <div className="p-3 pt-0">
        <p>
          <span className="font-semibold">{post.userId.username}</span> {post.caption}
        </p>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleCommentSubmit} className="p-3 border-t">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="hidden">Post</button>
      </form>
    </div>
  );
};

export default PostCard;
