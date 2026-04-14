const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET USER BY ID
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("User not found");

    // Never send password to client
    const { password, ...userInfo } = user._doc;
    res.status(200).json(userInfo);
  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      // If password is being updated, hash it
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      const { password, ...userInfo } = updatedUser._doc;
      res.status(200).json(userInfo);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can only update your own account");
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account deleted successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can only delete your own account");
  }
};

// FOLLOW A USER
const followUser = async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!user) return res.status(404).json("User not found");
      if (!currentUser) return res.status(404).json("Current user not found");

      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("You already follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You cannot follow yourself");
  }
};

// UNFOLLOW A USER
const unfollowUser = async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!user) return res.status(404).json("User not found");
      if (!currentUser) return res.status(404).json("Current user not found");

      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("You don't follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You cannot unfollow yourself");
  }
};

// GET USER'S FRIENDS / FOLLOWINGS
const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("User not found");

    const friends = await Promise.all(
      user.followings.map((friendId) => User.findById(friendId))
    );

    // Return only safe fields
    const friendList = friends.map(({ _doc }) => {
      const { password, ...rest } = _doc;
      return rest;
    });

    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  getUser,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  getFriends,
};