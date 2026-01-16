import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoute from "./routes/authRoutes.js";
import collectionRoute from "./routes/collectionRoutes.js";
import apiRequestRoute from "./routes/apiRequestRoutes.js";
import executeRoute from "./routes/proxyRoutes.js"; 

const app = express();

app.use(express.json({ limit: "10mb" })); 
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoute);
app.use("/api/collections", collectionRoute);
app.use("/api", apiRequestRoute);
app.use("/api/execute", executeRoute); 

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});