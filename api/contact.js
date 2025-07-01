// api/contact.js
const nodemailer = require("nodemailer");

// Konfigurasi transporter email dari Environment Variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Ini adalah App Password Google
  },
});

module.exports = async (req, res) => {
  // --- Pengaturan CORS (Penting untuk menghubungkan Netlify ke Vercel) ---
  // URL NETLIFY ANDA SUDAH DITAMBAHKAN DI SINI, TANPA TRAILING SLASH
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://stupendous-malasada-22ce7a.netlify.app" // <--- SUDAH DIKOREKSI, HILANGKAN SLASH AKHIR
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Tangani permintaan preflight OPTIONS (penting untuk CORS)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Name, email, and message are required." });
    }

    // Opsi email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.DESTINATION_EMAIL, // Email tujuan notifikasi
      subject: `Pesan Baru dari Portfolio: ${name}`,
      html: `
        <p>Anda menerima pesan baru dari formulir kontak portfolio Anda.</p>
        <h3>Detail Kontak:</h3>
        <ul>
          <li>Nama: ${name}</li>
          <li>Email: ${email}</li>
        </ul>
        <h3>Pesan:</h3>
        <p>${message}</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Pesan berhasil terkirim!" });
    } catch (error) {
      console.error("Error sending email:", error);
      res
        .status(500)
        .json({ message: "Gagal mengirim pesan.", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
};
