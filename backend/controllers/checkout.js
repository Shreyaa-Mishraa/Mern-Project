import axios from "axios";
import { Volunteer } from "../models/volunteer.js";

export const checkout = async (req, res) => {
    try {
        console.log("Checkout request received:", req.body);

        const { amount, ...volunteerData } = req.body;

        // Validate amount
        if (!amount || isNaN(amount) || amount < 3) {
            return res.status(400).json({
                success: false,
                message: "Minimum donation amount is 3 USDT"
            });
        }

        console.log("Creating invoice for amount:", amount);
        console.log("API Key exists:", !!process.env.PAYMENT_API_KEY);

        // Create invoice
        const invoice = await createPlisioInvoice(amount);

        console.log("Invoice response:", invoice);

        // Check invoice response
        if (!invoice || invoice.status !== 'success' || !invoice.data) {
            return res.status(400).json({
                success: false,
                message: "Failed to create payment invoice",
                error: invoice
            });
        }

        // Save volunteer data
        try {
            console.log("Saving volunteer data...");
            await Volunteer.create({
                ...volunteerData,
                amount,
                orderId: invoice.data.txn_id,
                paymentStatus: invoice.data.status,
            });
            console.log("Volunteer data saved successfully");
        } catch (dbError) {
            console.error("Database save error:", dbError);
            return res.status(500).json({
                success: false,
                message: "Failed to save volunteer data",
                error: dbError.message
            });
        }

        // Respond with success
        res.status(200).json({
            success: true,
            message: "Invoice created successfully",
            paymentUrl: invoice.data.invoice_url,
            txnId: invoice.data.txn_id,
            amount: invoice.data.amount,
            currency: invoice.data.currency,
            status: invoice.data.status
        });

    } catch (error) {
        console.error("=== CHECKOUT ERROR DETAILS ===");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        if (error.response) {
            console.error("API Response Status:", error.response.status);
            console.error("API Response Data:", error.response.data);
        }

        res.status(500).json({
            success: false,
            message: "Payment processing failed",
            error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
        });
    }
};

const createPlisioInvoice = async (amount) => {
    const API_KEY = process.env.PAYMENT_API_KEY;

    if (!API_KEY) {
        throw new Error("Payment API key is not configured");
    }

    // Round amount to 6 decimals (Plisio uses high precision)
    const roundedAmount = parseFloat(amount).toFixed(6);

    // Plisio requires minimum 2.9994 USDT, so we ensure at least 3
    if (parseFloat(roundedAmount) < 3) {
        throw new Error("Minimum donation must be at least 3 USDT");
    }

    const data = {
        amount: roundedAmount,
        currency: "USDT",
        order_name: "Donation Invoice",
        order_number: "donate_" + Date.now(),
        source: "api",
        callback_url: "https://mern-project-nine-neon.vercel.app/api/payment/status",
        success_url: "https://mern-project-nine-neon.vercel.app/donate/success",
        cancel_url: "https://mern-project-nine-neon.vercel.app/donate/failed",
    };

    console.log("Sending request to Plisio with data:", { ...data, api_key: "***hidden***" });

    try {
        const response = await axios.get(
            `https://api.plisio.net/api/v1/invoices/new`,
            {
                params: {
                    api_key: API_KEY,
                    ...data
                },
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 15000
            }
        );

        console.log("Plisio API response status:", response.status);
        return response.data;

    } catch (apiError) {
        console.error("=== PLISIO API ERROR ===");

        if (apiError.response) {
            console.error("Status:", apiError.response.status);
            console.error("Response data:", apiError.response.data);

            const message = apiError.response.data?.data?.message;
            if (message) {
                throw new Error(`Plisio Error: ${message}`);
            }
        } else if (apiError.code === 'ECONNABORTED') {
            throw new Error("Payment service timeout - please try again");
        } else {
            console.error("Network error:", apiError.message);
            throw new Error("Unable to connect to payment service");
        }

        throw apiError;
    }
};
