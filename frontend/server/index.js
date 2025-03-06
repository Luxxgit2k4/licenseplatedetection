import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import { configDotenv } from "dotenv";
import bodyParser from "body-parser";

configDotenv() // To load razorpay api key from the .env

const app = express();
app.use(cors());
app.use(bodyParser.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
})
