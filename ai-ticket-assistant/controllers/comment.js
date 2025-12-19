import Comment from "../models/comment.js";
import Ticket from "../models/ticket.js";

// ADD COMMENT TO TICKET
export const addComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    // Verify ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if user has access to this ticket
    const user = req.user;
    if (user.role === "user" && ticket.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const comment = await Comment.create({
      ticketId,
      author: user._id,
      content,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", ["email", "_id"]);

    return res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET COMMENTS FOR A TICKET
export const getComments = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Verify ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if user has access to this ticket
    const user = req.user;
    if (user.role === "user" && ticket.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const comments = await Comment.find({ ticketId })
      .populate("author", ["email", "_id"])
      .sort({ createdAt: 1 });

    return res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE COMMENT (only author or admin)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const user = req.user;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only author or admin can delete
    if (user.role !== "admin" && comment.author.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
