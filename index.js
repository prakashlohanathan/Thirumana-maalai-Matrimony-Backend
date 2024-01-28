import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dbConnection } from "./Database/dbConfig.js";
import { authRouter } from "./Controller/auth.js";
import { userRouter } from "./Controller/User.js";
import { invitationRouter } from "./Controller/invitations.js";
import { interestRouter } from "./Controller/interests.js";

const app = express();

// ENABLING ENVIRONMENT VARIABLE CONFIGS
dotenv.config();

// CONFIGURING CORS
app.use(cors());

//ENV configuration
dotenv.config();

//Connecting DB
dbConnection();

//Middlewares
app.use(express.json());
app.use(cors());

//routes
app.use("/api/auth",authRouter);
app.use("/api/user",userRouter);
app.use("/api/invitation",invitationRouter);
app.use("/api/interested",interestRouter);

// BASIC SERVER CONFIGS
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", (err) => {
  if (err) throw err;
  console.log(`Listening on PORT ${PORT}`);
});

