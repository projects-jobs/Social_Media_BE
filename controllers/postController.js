const Post = require("../models/Post");
const User = require("../models/User");

// CREATE POST
const createPost = async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE POST
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");

    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post updated successfully");
    } else {
      res.status(403).json("You can only update your own posts");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");

    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Post deleted successfully");
    } else {
      res.status(403).json("You can only delete your own posts");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// LIKE / DISLIKE A POST (toggle)
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");

    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("Post liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("Post disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// ADD COMMENT
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");

    const newComment = {
      userId: req.body.userId,
      text: req.body.text,
    };

    await post.updateOne({ $push: { comments: newComment } });
    res.status(200).json("Comment added successfully");
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET A SINGLE POST
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET TIMELINE POSTS (user + all followings)
const getTimelinePosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    if (!currentUser) return res.status(404).json("User not found");

    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => Post.find({ userId: friendId }))
    );

    // Merge and sort by newest first
    const allPosts = userPosts.concat(...friendPosts);
    allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(allPosts);
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET ALL POSTS BY A SPECIFIC USER
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
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