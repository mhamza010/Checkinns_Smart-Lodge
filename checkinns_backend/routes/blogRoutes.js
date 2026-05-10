import express from "express";
import Blog from "../models/Blog.js";

const router = express.Router();

// Get all published blogs
router.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get single blog by slug
router.get("/:slug", async (req, res) => {
    try {
        const blog = await Blog.findOneAndUpdate(
            { slug: req.params.slug, isPublished: true },
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!blog) return res.status(404).json({ error: "Blog not found" });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// Admin: Create blog (Simple auth check could be added, but for now we'll allow it for the dashboard to work)
router.post("/", async (req, res) => {
    try {
        const { title, content, mainImage, tags, author } = req.body;
        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const blog = await Blog.create({ title, slug, content, mainImage, tags, author });
        res.status(201).json(blog);
    } catch (err) {
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// Admin: Delete blog
router.delete("/:id", async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ message: "Blog deleted" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
