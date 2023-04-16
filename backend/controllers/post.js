const Post = require(`../model/post`);

exports.createPost = (request, response) => {
  const url = request.protocol + "://" + request.get("host");
  const post = new Post({
    title: request.body.title,
    content: request.body.content,
    imagePath: url + "/images/" + request.file.filename,
    creator: request.userData.userid,
  });
  post
    .save()
    .then((createdPost) => {
      response.status(201).json({
        message: `Post Created Successfully !!`,
        post: { ...createdPost, id: createdPost._id },
      });
    })
    .catch(() => {
      response.status(500).json({ message: "Post creation failed !!" });
    });
};

exports.updatePost = (request, response) => {
  let imagePath = request.body.imagePath;
  if (request.file) {
    const url = request.protocol + "://" + request.get("host");
    imagePath = url + "/images/" + request.file.filename;
  }
  const post = new Post({
    _id: request.params.id,
    title: request.body.title,
    content: request.body.content,
    imagePath: imagePath,
    creator: request.userData.userid,
  });
  Post.updateOne(
    { _id: request.params.id, creator: request.userData.userid },
    post
  )
    .then((updatedPost) => {
      if (updatedPost.modifiedCount > 0) {
        response
          .status(200)
          .json({ message: `Post updated Successfully`, id: updatedPost });
      } else {
        response.status(401).json({ message: `Not Authorized` });
      }
    })
    .catch(() => {
      response.status(500).json({ message: "Post updation failed !!" });
    });
};

exports.getAllUserPosts = (request, response) => {
  const pageSize = request.query.pageSize;
  const currentPage = request.query.page;
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
      response.status(200).json({
        message: `Post successfully retrived`,
        posts: fetchedDocuments,
        maxPosts: count,
      });
    })
    .catch(() => {
      response.status(500).json({ message: "Post updation failed !!" });
    });
};

exports.getPostById = (request, response) => {
  Post.findById(request.params.id)
    .then((result) => {
      if (result) {
        response.status(200).json(result);
      } else {
        response.status(404).json({ message: `Post not found` });
      }
    })
    .catch(() => {
      response.status(500).json({ message: "Post not found !!" });
    });
};

exports.deletePostById = (request, response) => {
  Post.deleteOne({
    _id: request.params.id,
    creator: request.userData.userid,
  })
    .then((result) => {
      if (result.deletedCount > 0) {
        response.status(200).json({ message: `Post Deleted Successfully !!` });
      } else {
        response.status(401).json({ message: `Not Authorized` });
      }
    })
    .catch(() => {
      response.status(500).json({ message: "Post deletion failed !!" });
    });
};
