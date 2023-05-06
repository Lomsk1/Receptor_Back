import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import compression from "compression";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import receiptRoute from "./routes/receiptRoutes";
import userRouter from "./routes/userRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.options("*", cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(express.json());

app.use(mongoSanitize());

// app.use(helmet());

// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//   })
// );
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Routes
app.use("/api/v1/receipt", receiptRoute);
app.use("/api/v1/users", userRouter);

app.use(xss());

// app.use(compression());

export default app;
