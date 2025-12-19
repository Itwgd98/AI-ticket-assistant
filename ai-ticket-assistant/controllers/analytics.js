import Ticket from "../models/ticket.js";
import User from "../models/user.js";

// GET DASHBOARD ANALYTICS (Admin/Moderator only)
export const getDashboardAnalytics = async (req, res) => {
  try {
    const user = req.user;

    if (user.role === "user") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Total tickets count
    const totalTickets = await Ticket.countDocuments();

    // Tickets by status
    const ticketsByStatus = await Ticket.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Tickets by priority
    const ticketsByPriority = await Ticket.aggregate([
      { $match: { priority: { $ne: null } } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    // Unassigned tickets
    const unassignedTickets = await Ticket.countDocuments({ assignedTo: null });

    // Total users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Recent tickets (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTickets = await Ticket.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Tickets created per day (last 7 days)
    const ticketsPerDay = await Ticket.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top skills in tickets
    const topSkills = await Ticket.aggregate([
      { $unwind: "$relatedSkills" },
      { $group: { _id: "$relatedSkills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return res.status(200).json({
      analytics: {
        totalTickets,
        ticketsByStatus: ticketsByStatus.reduce((acc, item) => {
          acc[item._id || "unknown"] = item.count;
          return acc;
        }, {}),
        ticketsByPriority: ticketsByPriority.reduce((acc, item) => {
          acc[item._id || "unknown"] = item.count;
          return acc;
        }, {}),
        unassignedTickets,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentTickets,
        ticketsPerDay,
        topSkills,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET USER STATS (for regular users)
export const getUserStats = async (req, res) => {
  try {
    const user = req.user;

    const totalTickets = await Ticket.countDocuments({ createdBy: user._id });

    const ticketsByStatus = await Ticket.aggregate([
      { $match: { createdBy: user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      stats: {
        totalTickets,
        ticketsByStatus: ticketsByStatus.reduce((acc, item) => {
          acc[item._id || "unknown"] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
