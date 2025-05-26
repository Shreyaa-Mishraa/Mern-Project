import axios from "axios";
import { Volunteer } from "../models/volunteer.js";

   export const checkout = async (req, res) => {
       try {
           console.log("Checkout request received:", req.body);
           
           const { amount, ...volunteerData } = req.body;
           
           // Validate amount
           if (!amount || isNaN(amount) || amount <= 0) {
               return res.status(400).json({
                   success: false,
                   message: "Valid amount is required"
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
                   amount,  // Include amount explicitly
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

  const data = {
    amount: amount.toString(),
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
      `https://api.plisio.net/api/v1/invoices/new?api_key=${API_KEY}&amount=${data.amount}&currency=${data.currency}&order_name=${data.order_name}&order_number=${data.order_number}&source=${data.source}&callback_url=${data.callback_url}&success_url=${data.success_url}&cancel_url=${data.cancel_url}`,
      {
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
      
      if (apiError.response.data?.data?.message) {
        throw new Error(`Plisio Error: ${apiError.response.data.data.message}`);
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
