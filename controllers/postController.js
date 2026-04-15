// controllers/postController.js
// FIXES:
//  1. ALL queries now .populate("userId", "username profilePicture")
//  2. comments.userId also populated so frontend gets username not _id
//  3. getTimelinePosts sorts correctly (using createdAt timestamps)
//  4. addComment returns the full updated post with populated fields

const Post = require("../models/Post");
const User = require("../models/User");

// ── Shared populate helper — call after any query ─────────────────────────
const POPULATE_OPTS = [
  { path: "userId",          select: "username profilePicture" },
  { path: "comments.userId", select: "username profilePicture" },
];

// ── CREATE POST ──────────────────────────────────────────────────────────
const createPost = async (req, res) => {
  try {
    const newPost    = new Post(req.body);
    const savedPost  = await newPost.save();
    // Populate before returning so frontend gets username immediately
    await savedPost.populate(POPULATE_OPTS);
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── UPDATE POST ──────────────────────────────────────────────────────────
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.body.userId)
      return res.status(403).json({ message: "You can only update your own posts" });

    await post.updateOne({ $set: req.body });
    res.status(200).json({ message: "Post updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE POST ──────────────────────────────────────────────────────────
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.userId.toString() !== req.body.userId)
      return res.status(403).json({ message: "You can only delete your own posts" });

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── LIKE / DISLIKE ───────────────────────────────────────────────────────
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json({ message: "Post liked" });
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json({ message: "Post disliked" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── ADD COMMENT ──────────────────────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      userId:    req.body.userId,
      text:      req.body.text,
      createdAt: new Date(),
    };

    await post.updateOne({ $push: { comments: newComment } });

    // Return the updated post with populated fields so frontend
    // can render username instantly without a separate fetch
    const updated = await Post
      .findById(req.params.id)
      .populate(POPULATE_OPTS);

    res.status(200).json({ message: "Comment added", post: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET SINGLE POST ──────────────────────────────────────────────────────
const getPost = async (req, res) => {
  try {
    const post = await Post
      .findById(req.params.id)
      .populate(POPULATE_OPTS);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET TIMELINE POSTS ───────────────────────────────────────────────────
const getTimelinePosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // Own posts
    const userPosts = await Post
      .find({ userId: currentUser._id })
      .populate(POPULATE_OPTS);

    // Friends' posts
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) =>
        Post.find({ userId: friendId }).populate(POPULATE_OPTS)
      )
    );

    const allPosts = userPosts.concat(...friendPosts);

    // Sort newest first (createdAt is a Date field)
    allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(allPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET ALL POSTS BY USER ────────────────────────────────────────────────
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post
      .find({ userId: req.params.userId })
      .populate(POPULATE_OPTS)   // FIX: comments.userId also populated
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  getPost,
  getTimelinePosts,
  getUserPosts,
};