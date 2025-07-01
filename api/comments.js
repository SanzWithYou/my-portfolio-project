// api/comments.js
const { Pool } = require("pg");

// Konfigurasi koneksi database Supabase dari Environment Variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Izinkan koneksi SSL dari Vercel
  },
});

module.exports = async (req, res) => {
  // --- Pengaturan CORS (Penting untuk menghubungkan Netlify ke Vercel) ---
  // URL NETLIFY ANDA SUDAH DITAMBAHKAN DI SINI, TANPA TRAILING SLASH
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://stupendous-malasada-22ce7a.netlify.app" // <--- SUDAH DIKOREKSI, HILANGKAN SLASH AKHIR
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Tangani permintaan preflight OPTIONS (penting untuk CORS)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    try {
      const result = await pool.query(
        "SELECT name, comment_text, created_at AS timestamp FROM comments ORDER BY created_at DESC"
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res
        .status(500)
        .json({ message: "Error fetching comments", error: error.message });
    }
  } else if (req.method === "POST") {
    const { name, text } = req.body;

    if (!name || !text) {
      return res
        .status(400)
        .json({ message: "Name and comment text are required." });
    }

    try {
      const result = await pool.query(
        "INSERT INTO comments (name, comment_text) VALUES ($1, $2) RETURNING name, comment_text, created_at AS timestamp",
        [name, text]
      );
      res.status(201).json({
        message: "Comment added successfully",
        comment: result.rows[0],
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      res
        .status(500)
        .json({ message: "Error adding comment", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
};
