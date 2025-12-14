import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../api/auth';
import PostCard from '../components/PostCard';

const HomeFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await authenticatedFetch('/posts/feed');
        setPosts(data);
      } catch (error) {
        console.error("Error fetching feed:", error);
        // Handle token expiration/redirect to login
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) return <div>Loading Feed...</div>;

  return (
    <div className="home-feed-container">
      {posts.length === 0 ? (
        <p>Follow users to see posts!</p>
      ) : (
        posts.map(post => <PostCard key={post._id} initialPost={post} />)
      )}
    </div>
  );
};

export default HomeFeed;
