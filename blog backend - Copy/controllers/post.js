const postModel = require('../models/postSchema');

const makePost = async (req, res) => {
   const { creatorId, ...others } = req.body; 
   const { id } = req.user; // Use the user's ID from the request
   const newPost = new postModel({ ...others, creatorId: id });

   try {
      await newPost.save();
      res.status(201).json({ message: "Post successfully created", post: newPost });
   } catch (error) {
      res.status(500).json({ error: "Cannot create post" });
      console.log(error);
   }
}

const getAllPost = async (req, res) => {
  try {
    const allPost = await postModel.find()
      .populate({ path: "creatorId", select: "userName email gender" })
      .populate({ path: "comment", select: "text commentorId" });

    res.status(200).json(allPost);
  } catch (error) {
    res.status(500).json({ error: "Cannot get posts" });
  }
}

// Update post
const updatePost = async (req, res) => {
  const { id, creatorId, likes, ...others } = req.body;

  try {
    const ownerPost = await postModel.findById(id);

    if (!ownerPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (ownerPost.creatorId.toString() !== creatorId) {
      return res.status(403).json({ error: "You can only update your own post" });
    }

    const updatedPost = await postModel.findByIdAndUpdate(id, { ...others }, { new: true });
    res.status(200).json({ message: "Post updated", post: updatedPost });

  } catch (error) {
    res.status(500).json({ error: "Cannot update post" });
  }
}

const getPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await postModel.findById(id)
      .populate({ path: "creatorId", select: "userName email gender" })
      .populate({ path: "comment", select: "text commentorId" });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Cannot get post" });
  }
}

const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPost = await postModel.findByIdAndDelete(id);
    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted", post: deletedPost });
  } catch (error) {
    res.status(500).json({ error: "Could not delete post" });
  }
}

// Add like/unlike feature
const likePost = async (req, res) => {
  const { id, name } = req.body;

  try {
    const post = await postModel.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const likesArray = post.likes;
    const isLiked = likesArray.includes(name);

    if (!isLiked) {
      likesArray.push(name); // Like the post
    } else {
      const index = likesArray.indexOf(name);
      likesArray.splice(index, 1); // Unlike the post
    }

    post.likes = likesArray;
    await post.save();

    res.status(200).json({ message: "Post like status updated", post });
  } catch (error) {
    res.status(500).json({ error: "Error processing like/unlike" });
  }
}

module.exports = { makePost, getAllPost, getPost, deletePost, updatePost, likePost };
