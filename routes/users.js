const router = require("express").Router();
const {
  getUser,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  getFriends,
} = require("../controllers/userController");

router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/:id/follow", followUser);
router.put("/:id/unfollow", unfollowUser);
router.get("/:id/friends", getFriends);

module.exports = router;