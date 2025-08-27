import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import notificationRoutes from "./routes/notification.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import { arcjetMiddleware } from "./middlewares/arcjet.middleware.js";
import dbConnection from "./config/db.js";
import { ENV } from "./config/env.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());
app.use(arcjetMiddleware());

// ✅ Test route (sirf sanity check ke liye)
app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "API is working 🚀", env: ENV.NODE_ENV });
});

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notification", notificationRoutes);

// ✅ 404 handler (agar route match na ho)
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found ❌" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error 💥", err);
  res.status(500).json({ error: "Something went wrong on server ❌" });
});

const startServer = async () => {
  try {
    await dbConnection(); // Connect to DB first
    if (ENV.NODE_ENV !== "production") {
      app.listen(ENV.PORT, () => {
        console.log(`Server is running on port ${ENV.PORT}`);
      });
    }
  } catch (error) {
    console.error(`Server startup error ❌`, error);
    process.exit(1); // Exit if DB connection or server startup fails
  }
};

startServer();

export default app;
