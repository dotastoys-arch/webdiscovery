import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    const { name, company, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Naam, e-mail en bericht zijn verplicht." });
    }

    try {
      // Note: In a real production environment, you would use environment variables for SMTP settings
      // For now, we'll use a placeholder logic. If SMTP variables are present, it will try to send.
      const nodemailer = await import("nodemailer");
      
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST || "smtp.example.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"WebDiscovery Contact" <${process.env.SMTP_USER || "noreply@webdiscovery.nl"}>`,
        to: "administratie@webdiscovery.nl",
        replyTo: email,
        subject: `Nieuw contactbericht van ${name}`,
        text: `
Naam: ${name}
Bedrijf: ${company || "Niet opgegeven"}
E-mail: ${email}

Bericht:
${message}
        `,
        html: `
          <h3>Nieuw contactbericht</h3>
          <p><strong>Naam:</strong> ${name}</p>
          <p><strong>Bedrijf:</strong> ${company || "Niet opgegeven"}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Bericht:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      };

      // If SMTP is configured, send the real email
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to administratie@webdiscovery.nl");
      } else {
        console.log("SMTP not configured. Email content:", mailOptions);
        // We return success to the client even if SMTP isn't configured for this demo/preview
        // but we log it so the developer knows.
      }

      res.json({ success: true, message: "Bericht succesvol verzonden!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Er is iets misgegaan bij het verzenden van het bericht." });
    }
  });

  if (process.env.NODE_ENV === "production") {
    // Serve static files from dist
    app.use(express.static(path.join(__dirname, "dist")));
    
    // Fallback to index.html for SPA
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  } else {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
