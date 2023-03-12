const express = require(`express`);
const multer = require(`multer`);

const router = express.Router();
const Post = require(`../model/post`);
const checkAuth = require(`../middleware/check-auth`);

const MIME_TYPE = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE[file.mimetype];
    let error = new Error("Invalid file type");
    if (isValid) {
      error = null;
    }
    cb(error, `backend/images`);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.split(" ").join("-");
    const ext = MIME_TYPE[file.mimetype];
    cb(null, fileName + "-" + Date.now() + "." + ext);
  },
});

router.post(
  `/api/posts`,
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userid
    });
    post.save().then((createdPost) => {
      res.status(201).json({
        message: `Success`,
        post: { ...createdPost, id: createdPost._id },
      });
    });
  }
);

router.put(
  `/api/updatePost/:id`,
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const post = new Post({
      _id: req.params.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
    });
    Post.updateOne({ _id: req.params.id }, post).then((updatedPost) => {
      res.status(200).json({ message: `Post updated`, id: updatedPost });
    });
  }
);

router.get(`/api/posts`, (req, res, next) => {
  const pageSize = req.query.pageSize;
  const currentPage = req.query.page;
  const postQuery = Post.find();

  let fetchedDocuments;

  if (pageSize && currentPage) {
    postQuery
      .find()
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
    .then((documents) => {
      fetchedDocuments = documents;
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: `Post successfully retrived`,
        posts: fetchedDocuments,
        maxPosts: count,
      });
    });
});

router.get(`/api/post/:id`, (req, res) => {
  Post.findById(req.params.id).then((response) => {
    if (response) {
      res.status(200).json(response);
    } else {
      res.status(404).json({ message: `Post not found` });
    }
  });
});

router.delete(`/api/deletePost/:id`, checkAuth, (req, res) => {
  Post.findByIdAndDelete({ _id: req.params.id }).then((result) => {
    res.status(200).json({ message: `ID DELETED SUCCESSFULLY` });
  });
});

module.exports = router;
