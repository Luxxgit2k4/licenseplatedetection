import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import { configDotenv } from "dotenv";
import crypto from "crypto";
import bodyParser from "body-parser";

configDotenv() // To load razorpay api key from the .env

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false}));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

app.post("/order", async (req, res) => {
  try {
  const options = req.body;
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order"});
  }
});

app.post("/verify-payment", async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");
  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: "Transaction is not legit!"});
  }

 res.json({ message: "Success", orderId: razorpay_order_id, paymentId: razorpay_payment_id, });
});

const PORT = 8007;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
