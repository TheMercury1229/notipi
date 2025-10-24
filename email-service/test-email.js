import axios from "axios";

const EMAIL_SERVICE_URL = "http://localhost:5001/api/send-email";
const API_KEY = "notipi_live_29b5672daa2e0b17849463af503a1479";
const TEMPLATE_SLUG = "scientific-beige-warbler";

async function sendTestEmail() {
  try {
    const response = await axios.post(
      EMAIL_SERVICE_URL,
      {
        to: "roman844646@gmail.com", // your test email
        subject: "Test Email from Notipi 🚀",
        templateSlug: TEMPLATE_SLUG,
        data: { name: "Rudra", email: "roman844646@gmail.com" },
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent successfully!");
    console.log("Response:", response.data);
  } catch (error) {
    console.error("❌ Email failed!");
    console.log(error.response?.data || error.message);
  }
}

sendTestEmail();
