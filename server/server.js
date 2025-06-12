const express = require("express");  
const axios = require("axios");      
const path = require("path");

const app = express();              
const PORT = 3000;                  


const SECURITY_HEADERS = [
  "content-security-policy",
  "x-frame-options",
  "strict-transport-security",
  "referrer-policy",
  "permissions-policy",
  "x-content-type-options"
];

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/check", async (req, res) => {
  const url = req.body.url;

  if (!url) {
    return res.status(400).json({ error: "URL fehlt im Request-Body." });
  }

  if (isUnsafeUrl(url)) {
    return res.status(400).json({ error: "Lokale IPs sind nicht erlaubt." });
  }

  try {
    const response = await axios.get(url, {
      maxRedirects: 0,        
      timeout: 5000,          
      headers: {
        "User-Agent": "HeaderCheckerBot/1.0"  
      },
      validateStatus: () => true  
    });

    const headers = response.headers;

    const bewertung = {};
    for (const h of SECURITY_HEADERS) {
      bewertung[h] = headers[h] ? "OK" : "FEHLT";
    }

    res.json({ url, status: response.status, bewertung });

  } catch (err) {
    res.status(500).json({ url, error: err.message });
  }
});

function isUnsafeUrl(url) {
  return /localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])/.test(url);
}

app.listen(PORT, () => {
  console.log(`Header-Checker API läuft auf http://localhost:${PORT}`);
});