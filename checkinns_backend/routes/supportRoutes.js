import express from "express";
import SupportMessage from "../models/SupportMessage.js";
import PlatformConfig from "../models/PlatformConfig.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// Get status (Is admin online?)
router.get("/status", async (req, res) => {
    try {
        const config = await PlatformConfig.findOne({});
        // If last active was more than 5 mins ago, consider offline
        const isActuallyOnline = config?.isAdminOnline && (new Date() - new Date(config.adminLastActive) < 5 * 60 * 1000);
        res.json({ online: isActuallyOnline });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Admin: Update status (Ping)
router.post("/status/ping", async (req, res) => {
    try {
        await PlatformConfig.updateOne({}, { 
            isAdminOnline: true, 
            adminLastActive: new Date() 
        }, { upsert: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get messages for a session/user
router.get("/messages/:userId", async (req, res) => {
    try {
        const messages = await SupportMessage.find({ userId: req.params.userId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// User: Send message
router.post("/user", async (req, res) => {
    try {
        const { userId, text, userName } = req.body;
        const msg = await SupportMessage.create({
            userId,
            userName: userName || "Guest",
            text,
            senderRole: 'user'
        });

        // Create notification for Admin
        await Notification.create({
            recipient: "admin", // Special recipient for super admin
            role: "admin",
            type: "support",
            message: `New support message from ${userName || "Guest"}`,
            isRead: false
        });

        res.status(201).json(msg);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Admin: Reply to message
router.post("/admin", async (req, res) => {
    try {
        const { userId, text } = req.body;
        const msg = await SupportMessage.create({
            userId,
            text,
            senderRole: 'admin',
            isAdminReplied: true
        });

        // Create notification for User if they are logged in (we'd need their user ID if it's not a guest)
        // For now, let's just mark it as replied
        await SupportMessage.updateMany({ userId, senderRole: 'user' }, { isAdminReplied: true });

        res.status(201).json(msg);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Admin: Get all active chats
router.get("/chats", async (req, res) => {
    try {
        const chats = await SupportMessage.aggregate([
            { $sort: { createdAt: -1 } },
            { $group: {
                _id: "$userId",
                lastMessage: { $first: "$text" },
                userName: { $first: "$userName" },
                updatedAt: { $first: "$updatedAt" },
                unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$senderRole", "user"] }, { $eq: ["$isRead", false] }] }, 1, 0] } }
            }},
            { $sort: { updatedAt: -1 } }
        ]);
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
