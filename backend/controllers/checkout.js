import axios from "axios";
import { Volunteer } from "../models/volunteer.js";

export const checkout = async (req, res) => {
  try {
    const { amount, ...volunteerData } = req.body;

    const invoice = await createPlisioInvoice(amount);

    await Volunteer.create({
      ...volunteerData,
      orderId: invoice.data.txn_id,
      paymentStatus: invoice.data.status,
    });

    res.status(200).json(invoice);
  } catch (error) {
    console.error("Checkout Error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const createPlisioInvoice = async (amount) => {
  const API_KEY = process.env.PAYMENT_API_KEY;

  const data = {
    amount: amount.toString(),
    currency: "USDT", // or BTC/ETH/etc. based on what you enabled
    order_name: "Donation Invoice",
    order_number: "donate_" + Date.now(),
    source: "api",
    callback_url: "https://mern-project-nine-neon.vercel.app/api/payment/status",
    success_url: "https://mern-project-nine-neon.vercel.app/donate/success",
    cancel_url: "https://mern-project-nine-neon.vercel.app/donate/failed",
  };

  const response = await axios.post(
    `https://plisio.net/api/v1/invoices/new`,
    new URLSearchParams({
      ...data,
      api_key: API_KEY,
    }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  return response.data;
};
