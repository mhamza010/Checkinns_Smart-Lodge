import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    author: { type: String, default: "Check-Inns Team" },
    mainImage: { type: String },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: true },
    views: { type: Number, default: 0 }
}, { timestamps: true });

const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
