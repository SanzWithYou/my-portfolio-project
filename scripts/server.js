const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

async function initializeDatabase() {
  try {
    console.log("--- DEBUGGING .env VALUES ---");
    console.log(`DB_HOST: '${process.env.DB_HOST}'`);
    console.log(`DB_USER: '${process.env.DB_USER}'`);
    console.log(
      `DB_PASSWORD: '${
        process.env.DB_PASSWORD ? "********" : "Tidak ada password (kosong)"
      }' (Length: ${
        process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0
      })`
    );
    console.log(`DB_NAME: '${process.env.DB_NAME}'`);
    console.log(`EMAIL_USER: '${process.env.EMAIL_USER}'`);
    console.log(
      `EMAIL_PASS: '${
        process.env.EMAIL_PASS ? "********" : "Tidak ada password (kosong)"
      }'`
    );
    console.log(`DESTINATION_EMAIL: '${process.env.DESTINATION_EMAIL}'`);
    console.log("-----------------------------");

    pool = mysql.createPool(dbConfig);
    console.log("Koneksi ke database MySQL berhasil dibuat!");
    await pool.query("SELECT 1");
    console.log("Database siap digunakan.");
  } catch (error) {
    console.error("Gagal terhubung ke database MySQL:", error.message);
    setTimeout(() => {
      process.exit(1);
    }, 100);
  }
}
initializeDatabase();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.use(express.static(path.join(__dirname, "../")));

app.use(bodyParser.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  })
);

let lastCommentTime = {};

const COOLDOWN_DURATION_MS = 1 * 60 * 60 * 1000 + 30 * 60 * 1000;

const EXCLUDED_IPS = ["127.0.0.1", "::1"];

function isContentClean(text) {
  const normalizedText = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "")
    .replace(/4/g, "a")
    .replace(/@/g, "a")
    .replace(/3/g, "e")
    .replace(/1/g, "i")
    .replace(/0/g, "o")
    .replace(/5/g, "s")
    .replace(/\+/g, "t")
    .replace(/_/g, "")
    .replace(/-/g, "")
    .replace(/\$/g, "s")
    .replace(/\|/g, "i");

  const forbiddenPatterns = [
    /kontol/,
    /memek/,
    /anjing/,
    /babi/,
    /bangsat/,
    /bajingan/,
    /fuck/,
    /shit/,
    /asshole/,
    /pussy/,
    /dick/,
    /cunt/,
    /nigga/,
    /whore/,
    /slut/,
    /goblog/,
    /goblok/,
    /idiot/,
    /tolol/,
    /kampret/,
    /brengsek/,
    /jembut/,
    /pepek/,
    /titit/,
    /ngentot/,
    /kimak/,
    /asu/,
    /jempol/,
    /anjg/,
    /bgsd/,
    /mmk/,
    /ktl/,
    /cuk/,
    /jancok/,
    /tai/,
    /bgst/,
    /pantek/,
    /bajing/,
    /keparat/,
    /seks/,
    /sex/,
    /bugil/,
    /telanjang/,
    /porno/,
    /hentai/,
    /bokep/,
    /cabul/,
    /mesum/,
    /crot/,
    /esekesek/,
    /18plus/,
    /dewasa/,
    /mature/,
    /bispak/,
    /kimcil/,
    /lonte/,
    /gigolo/,
    /bbplus/,
    /ngewe/,
    /mesum/,
    /teroris/,
    /rasis/,
    /genosida/,
    /pki/,
    /sara/,
    /bunuhdiri/,
    /bunuh/,
    /perang/,
    /narkoba/,
    /narkotika/,
    /ganja/,
    /sabu/,
    /ekstasi/,
    /radikal/,
    /ekstremis/,
    /propaganda/,
    /hoax/,
    /penipuan/,
    /phising/,
    /scam/,
    /judi/,
    /slot/,
    /bom/,
    /silet/,
    /racun/,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(normalizedText)) {
      console.log(
        `[FILTER AKTIF] Kata terlarang terdeteksi: '${pattern.source}' di teks asli: '${text}' (normalisasi: '${normalizedText}')`
      );
      return false;
    }
  }
  return true;
}

app.get("/api/comments", async (req, res) => {
  console.log("GET /api/comments request received.");
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, comment_text, timestamp FROM comments ORDER BY timestamp DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching comments from MySQL:", error);
    res.status(500).json({
      message: "Gagal mengambil komentar dari database.",
    });
  }
});

app.post("/api/comments", async (req, res) => {
  console.log("POST /api/comments request received:", req.body);
  const { name, text } = req.body;

  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  console.log(`Request from IP: ${clientIp}`);

  const trimmedExcludedIps = EXCLUDED_IPS.map((ip) => ip.trim());
  let bypassCooldown = trimmedExcludedIps.includes(clientIp.trim());

  if (!bypassCooldown) {
    const currentTime = Date.now();
    if (
      lastCommentTime[clientIp] &&
      currentTime - lastCommentTime[clientIp] < COOLDOWN_DURATION_MS
    ) {
      const remainingTimeMs =
        COOLDOWN_DURATION_MS - (currentTime - lastCommentTime[clientIp]);
      const minutes = Math.floor(remainingTimeMs / (1000 * 60));
      const seconds = Math.floor((remainingTimeMs % (1000 * 60)) / 1000);

      return res.status(429).json({
        message: `Mohon tunggu ${minutes} menit ${seconds} detik lagi sebelum mengirim komentar baru.`,
      });
    }
  }

  if (!name || !text) {
    return res.status(400).json({
      message: "Nama dan komentar tidak boleh kosong.",
    });
  }

  if (!isContentClean(name)) {
    return res.status(400).json({
      message: "Nama mengandung kata-kata yang tidak pantas.",
    });
  }

  if (!isContentClean(text)) {
    return res.status(400).json({
      message: "Komentar mengandung kata-kata yang tidak pantas.",
    });
  }

  try {
    const currentTime = new Date();
    const [result] = await pool.execute(
      "INSERT INTO comments (name, comment_text, timestamp) VALUES (?, ?, ?)",
      [name, text, currentTime]
    );

    const newCommentId = result.insertId;
    const newComment = {
      id: newCommentId,
      name: name,
      comment_text: text,
      timestamp: currentTime.toISOString(),
    };

    if (!bypassCooldown) {
      lastCommentTime[clientIp] = Date.now();
    }

    console.log("Komentar baru ditambahkan ke MySQL DB:", newComment);

    if (
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS &&
      process.env.DESTINATION_EMAIL
    ) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.DESTINATION_EMAIL,
        subject: "Notifikasi Komentar Baru di Portfolio Anda!",
        html: `
                        <p>Anda mendapatkan komentar baru di situs portfolio Anda.</p>
                        <p><strong>Nama:</strong> ${name}</p>
                        <p><strong>Komentar:</strong></p>
                        <p style="white-space: pre-wrap; font-style: italic;">${text}</p>
                        <p><strong>Waktu:</strong> ${newComment.timestamp}</p>
                        <br>
                        <p>Ini adalah email otomatis, jangan balas.</p>
                    `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    } else {
      console.warn(
        "Informasi pengiriman email tidak lengkap di .env. Email tidak akan dikirim."
      );
    }

    res.status(201).json({
      message: "Komentar berhasil ditambahkan!",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment to MySQL DB:", error);
    res.status(500).json({
      message: "Gagal menambahkan komentar ke database.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server Express berjalan di http://localhost:${PORT}`);
  console.log(`Buka halaman Anda di http://localhost:${PORT}/index.html`);
});
