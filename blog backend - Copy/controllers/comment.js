const Comment = require('../models/commentSchema');
const postModel = require('../models/postSchema');

const postComment = async (req, res) => {
  const { text, postId } = req.body;
  const { id } = req.user;
  try {
    const existingComment = await Comment.findOne({ text, postId });
    if (existingComment) {
      return res.status(400).json({ message: "Oops! You've already said that" });
    }
    
    const newComment = new Comment({ text, commentorId: id, postId });
    const saveComment = await newComment.save();

    // Modify postModel to include comment
    await postModel.findByIdAndUpdate(postId, {
      $push: { comment: saveComment.id } 
    });
    
    res.status(201).json({ message: "Commented successfully", comment: saveComment });
  } catch (error) {
    res.status(500).json({ error: "Unable to post comment" });
  }
};

const editComment = async (req, res) => {
  const { id } = req.params;
  const { text, ...others } = req.body;

  try {
    const checkID = await Comment.findById(id);
    if (!checkID) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (!text) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const updateComment = await Comment.findByIdAndUpdate(
      id,
      { text, ...others },
      { new: true } 
    );

    res.status(200).json({ message: "Comment updated successfully", comment: updateComment });
  } catch (error) {
    res.status(500).json({ error: "Could not edit comment" });
  }
};

// Like or unlike comment
const likeComment = async (req, res) => {
  const { id } = req.params; 
  const { userName } = req.body; 
  try {
    const comment = await Comment.findById(id); 
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likesArray = comment.likes;
    const isLiked = likesArray.includes(userName);

    if (!isLiked) {
      likesArray.push(userName); 
    } else {
      const index = likesArray.indexOf(userName);
      likesArray.splice(index, 1); 
    }

    comment.likes = likesArray;
    await comment.save(); 
    res.status(200).json({ message: 'Like status updated', comment });
  } catch (error) {
    res.status(500).json({ error: 'Error updating like status' });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedComment = await Comment.findByIdAndDelete(id); 
    if (!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json({ message: 'Comment deleted successfully', comment: deletedComment });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting comment' }); 
  }
};

// Get all comments for a specific post
const getComments = async (req, res) => {
  const { postId } = req.params; 
  try {
    const comments = await Comment.find({ postId }); 
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
};

module.exports = { postComment, editComment, likeComment, deleteComment, getComments };
