const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // hoặc dùng axios
const app = express();

// Đọc danh sách các origin được phép từ biến môi trường
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Ví dụ route API
app.post('/api/ai-design', (req, res) => {
  res.json({ design: "This is your AI-generated design based on the prompt." });
});

app.post('/api/gemini', async (req, res) => {
  const prompt = req.body.prompt || "Explain how AI works in a few words";
  const apiKey = process.env.GEMINI_API_KEY;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: prompt }] }
      ]
    })
  });

  const data = await response.json();
  res.json(data);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Allowed Origins:', allowedOrigins);
});