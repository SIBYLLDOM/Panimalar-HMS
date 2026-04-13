import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import studentRoutes from "./routes/students.js";
import hostelRoutes from "./routes/hostels.js";
import roomRoutes from "./routes/rooms.js";
import leaveRoutes from "./routes/leave.js";
import roomChangeRoutes from "./routes/roomChange.js";
import billingRoutes from "./routes/billing.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/room-change", roomChangeRoutes);
app.use("/api/billing", billingRoutes);

// Role-based dashboard routes
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Panimalar Hostel Management System API is running...");
});

export default app;