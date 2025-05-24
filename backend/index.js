import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {dbConnection} from "./database/dbConnection.js"
import messageRouter from "./"

const app = express();
dotenv.config({path:"./config.env"})

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods: ["POST"],
    credentials: true,
})
);

app.use(express.json());
app.use(express.urlencoded({extended : true}));

dbConnection();

export default app;