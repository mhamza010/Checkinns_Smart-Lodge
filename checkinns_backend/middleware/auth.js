import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET } from "../config/config.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, JWT_SECRET); // ✅ use the secret from config
    req.user = { id: decoded.id };

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: "Token is invalid" });
  }
};

export default authMiddleware;










