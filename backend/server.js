import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import constraintRoutes from "./routes/constraintRoutes.js";
import scheduleJobs from "./cronJobs.js";

const port = process.env.PORT || 5000;

connectDB(); // Connect to MongoDB

const app = express();

// Request body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/constraints", constraintRoutes);

const __dirname = path.resolve(); // Set __dirname to the absolute path of the project folder
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

app.use(notFound);
app.use(errorHandler);

// Schedule cron jobs
scheduleJobs();

app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});
