const express = require("express");
const cors = require("cors");
const path = require("path");

const convertRoute = require("./routes/convert");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/convert", convertRoute);

// Static hosting for GLB files
app.use("/models", express.static(path.join(__dirname, "../public/models")));

const PORT = 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
