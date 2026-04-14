const router = require("express").Router();
const {
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  getPost,
  getTimelinePosts,
  getUserPosts,
} = require("../controllers/postController");

router.post("/", createPost);
router.get("/:id", getPost);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);
router.put("/:id/like", likePost);
router.put("/:id/comment", addComment);
router.get("/timeline/:userId", getTimelinePosts);
router.get("/profile/:userId", getUserPosts);

module.exports = router;