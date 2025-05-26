import axios from "axios";
import { Volunteer } from "../models/volunteer.js";

export const checkout = async (req, res) => {
  try {
    console.log("Checkout request received:", req.body);

    const { amount, ...volunteerData } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "A valid numeric amount is required",
      });
    }

    const invoice = await createPlisioInvoice(Number(amount));

    if (!invoice || invoice.status !== "success" || !invoice.data) {
      return res.status(502).json({
        success: false,
        message: "Failed to create invoice",
        error: invoice,
      });
    }

    try {
      await Volunteer.create({
        ...volunteerData,
        amount,
        orderId: invoice.data.txn_id,
        paymentStatus: invoice.data.status,
      });
    } catch (dbError) {
      console.error("DB error:", dbError);
      return res.status(500).json({
        success: false,
        message: "Failed to save volunteer",
        error: dbError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice created",
      paymentUrl: invoice.data.invoice_url,
      txnId: invoice.data.txn_id,
      amount: invoice.data.amount,
      currency: invoice.data.currency,
      status: invoice.data.status,
    });

  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Plisio response error:", error.response.data);
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const createPlisioInvoice = async (amount) => {
  const API_KEY = process.env.PAYMENT_API_KEY;

  if (!API_KEY) throw new Error("PAYMENT_API_KEY is not set");

  const data = {
    amount: amount.toString(),
    currency: "USDT",
    order_name: "Donation Invoice",
    order_number: `donate_${Date.now()}`,
    source: "api",
    callback_url: "https://mern-project-nine-neon.vercel.app/api/payment/status",
    success_url: "https://mern-project-nine-neon.vercel.app/donate/success",
    cancel_url: "https://mern-project-nine-neon.vercel.app/donate/failed",
  };

  console.log("Creating invoice with:", { ...data, api_key: "HIDDEN" });

  try {
    const res = await axios.get(
      `https://api.plisio.net/api/v1/invoices/new?api_key=${API_KEY}&amount=${data.amount}&currency=${data.currency}&order_name=${data.order_name}&order_number=${data.order_number}&source=${data.source}&callback_url=${data.callback_url}&success_url=${data.success_url}&cancel_url=${data.cancel_url}`,
      { headers: { "Content-Type": "application/json" }, timeout: 15000 }
    );

    return res.data;

  } catch (apiError) {
    console.error("Invoice creation error:", apiError.message);
    if (apiError.response?.data?.data?.message) {
      throw new Error(`Plisio Error: ${apiError.response.data.data.message}`);
    } else {
      throw new Error("Invoice creation failed - see server logs");
    }
  }
};
