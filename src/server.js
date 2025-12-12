const express = require("express");
const cors = require("cors");
const path = require("path");

const convertRoute = require("./routes/convert");

const app = express();
app.use(cors());
app.use(express.json());

// ADD THIS HERE (simple GET for testing)
app.get("/api/convert", (req, res) => {
  res.send("Convert API is online, but GET is not supported.");
});

// Your actual POST route
app.use("/api/convert", convertRoute);

// Static hosting for GLB files
app.use("/models", express.static(path.join(__dirname, "../public/models")));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
