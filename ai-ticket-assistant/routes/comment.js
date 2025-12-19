import express from "express";
import { addComment, getComments, deleteComment } from "../controllers/comment.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Add comment to a ticket
router.post("/:ticketId", authenticate, addComment);

// Get all comments for a ticket
router.get("/:ticketId", authenticate, getComments);

// Delete a comment
router.delete("/:commentId", authenticate, deleteComment);

export default router;
