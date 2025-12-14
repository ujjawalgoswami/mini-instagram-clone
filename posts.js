const router = require('express').Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const Like = require('../models/Like');
const Comment = require('../models/Comment');

// --- 1. Create Post ---
router.post('/', auth, async (req, res) => {
  const { imageUrl, caption } = req.body;
  try {
    const newPost = new Post({
      userId: req.user.id,
      imageUrl,
      caption
    });
    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- 2. Get Home Feed (Core Requirement 6) ---
router.get('/feed', auth, async (req, res) => {
  try {
    // Get IDs of users the logged-in user follows
    const followingUsers = await Follow.find({ followerId: req.user.id }).select('followingId');
    const followingIds = followingUsers.map(f => f.followingId);
    
    // Add the user's own ID to see their posts too (optional for Instagram-style)
    followingIds.push(req.user.id); 

    // Find posts from the followed users (and self)
    const posts = await Post.find({ userId: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .populate('userId', 'username') // Join with User to show post author
      .lean(); // Use .lean() for faster reads before adding dynamic data

    // Attach likes and comments count dynamically (Optimization needed in real app)
    for (let post of posts) {
        post.likesCount = await Like.countDocuments({ postId: post._id });
        post.commentsCount = await Comment.countDocuments({ postId: post._id });
        post.isLiked = await Like.exists({ userId: req.user.id, postId: post._id });
    }

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- 3. Like/Unlike Post (Requirement 4) ---
router.post('/:postId/like', auth, async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;
    try {
        const existingLike = await Like.findOne({ postId, userId });
        
        if (existingLike) {
            // Unlike
            await existingLike.deleteOne();
            return res.json({ msg: 'Post unliked', liked: false });
        } else {
            // Like
            const newLike = new Like({ postId, userId });
            await newLike.save();
            return res.json({ msg: 'Post liked', liked: true });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- 4. Comment on Post (Requirement 5) ---
router.post('/:postId/comment', auth, async (req, res) => {
    const { postId } = req.params;
    const { text } = req.body;
    try {
        const newComment = new Comment({
            postId,
            userId: req.user.id,
            text
        });
        const comment = await newComment.save();
        // Populate user details for immediate display
        await comment.populate('userId', 'username'); 
        res.json(comment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
