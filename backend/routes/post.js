const express = require(`express`);
const router = express.Router();
const checkAuth = require(`../middleware/check-auth`);
const extractFile = require(`../middleware/file`);
const PostController = require(`../controllers/post`);

router.post(`/api/posts`, checkAuth, extractFile, PostController.createPost);

router.put(
  `/api/updatePost/:id`,
  checkAuth,
  extractFile,
  PostController.updatePost
);

router.get(`/api/posts`, PostController.getAllUserPosts);

router.get(`/api/post/:id`, PostController.getPostById);

router.delete(`/api/deletePost/:id`, checkAuth, PostController.deletePostById);

module.exports = router;
