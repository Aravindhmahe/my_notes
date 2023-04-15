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
      creator: req.userData.userid,
    });
    post
      .save()
      .then((createdPost) => {
        res.status(201).json({
          message: `Post Created Successfully !!`,
          post: { ...createdPost, id: createdPost._id },
        });
      })
      .catch(() => {
        res.status(500).json({ message: "Post creation failed !!" });
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
      creator: req.userData.userid,
    });
    Post.updateOne({ _id: req.params.id, creator: req.userData.userid }, post)
      .then((updatedPost) => {
        if (updatedPost.modifiedCount > 0) {
          res
            .status(200)
            .json({ message: `Post updated Successfully`, id: updatedPost });
        } else {
          res.status(401).json({ message: `Not Authorized` });
        }
      })
      .catch(() => {
        res.status(500).json({ message: "Post updation failed !!" });
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
    })
    .catch(() => {
      res.status(500).json({ message: "Post updation failed !!" });
    });
});

router.get(`/api/post/:id`, (req, res) => {
  Post.findById(req.params.id)
    .then((response) => {
      if (response) {
        res.status(200).json(response);
      } else {
        res.status(404).json({ message: `Post not found` });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Post not found !!" });
    });
});

router.delete(`/api/deletePost/:id`, checkAuth, (req, res) => {
  Post.deleteOne({
    _id: req.params.id,
    creator: req.userData.userid,
  })
    .then((result) => {
      if (result.deletedCount > 0) {
        res.status(200).json({ message: `Post Deleted Successfully !!` });
      } else {
        res.status(401).json({ message: `Not Authorized` });
      }
    })
    .catch(() => {
      res.status(500).json({ message: "Post deletion failed !!" });
    });
});

module.exports = router;
