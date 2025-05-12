import express, { request } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from "cors";
import healthRoutes from "./routes/health.routes.js";
import userRoute from "./routes/user.route.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Global rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100,
    message: "Too many requests from this IP, please try again later"
})

// security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use('/api', limiter);


// logging middleware
if(process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Body parser middleware
app.use(express.json({limit: "10kb"}));
app.use(express.urlencoded({extended: true, limit: "10kb"}));
app.use(cookieParser());

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: "error",
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && {stack: err.stack})
    })
})

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
        "Content-Type", 
        "Authorization",
        "X-Requested-With",
        "device-remember-token",
        "Access-Control-Allow-Origin",
        "Origin",
        "Accept"
    ]
}))


// API routes
app.use("/health", healthRoutes)
app.use("/api/v1/user", userRoute)


// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found"
    });
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    
})
