import axios from "axios";
import crypto from "crypto";
import { Volunteer } from "../models/volunteer.js";

export const checkout = async (req, res) => {
  try {
    const { amount } = req.body;
    const invoice = await createInvoice(amount);
    await Volunteer.create({
      ...req.body,
      orderId: invoice.result.order_id,
      paymentStatus: invoice.result.status,
    });
    res.send(invoice);
    console.log(amount);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//Base URL
const cryptomus = axios.create({ baseURL: "https://api.cryptomus.com/v1" });

c