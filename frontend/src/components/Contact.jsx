import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [disableBtn, setDisableBtn] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Check if all fields are filled
    if (!name || !email || !phone || !message) {
      return toast.error("Please fill in all fields.");
    }

    try {
      setDisableBtn(true); 
      const { data } = await axios.post(
        "https://mern-project-u8ij.onrender.com/api/v1/message/send", 
        { name, email, phone, message },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      // Reset fields on success
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      toast.success(data.message);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setDisableBtn(false); // Re-enable button
    }
  };

  return (
    <section className="contact">
      <div className="container">
        <div className="banner">
          <form onSubmit={handleSendMessage}>
            <h2>CONTACT US</h2>
            <div>
              <input
                type="text"
                value={name}
                placeholder="Your Name"
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                value={email}
                placeholder="Your Email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="number"
                value={phone}
                placeholder="Phone Number"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <textarea
              rows="10"
              value={message}
              placeholder="Message"
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="btn" type="submit" disabled={disableBtn}>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
