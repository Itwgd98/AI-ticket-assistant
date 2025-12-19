import express from "express";
import { getDashboardAnalytics, getUserStats } from "../controllers/analytics.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Get dashboard analytics (admin/moderator)
router.get("/dashboard", authenticate, getDashboardAnalytics);

// Get user stats
router.get("/user", authenticate, getUserStats);

export default router;
