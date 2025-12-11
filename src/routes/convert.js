const express = require("express");
const router = express.Router();
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("dwg"), async (req, res) => {
  try {
    const filePath = req.file.path;              // uploads/xxxxxx
    const fileName = req.file.filename;          // xxxxxx
    const uploadsDir = path.join(__dirname, "../../uploads");
    const tempDir = path.join(__dirname, "../../temp");
    const dxfPath = path.join(tempDir, `${fileName}.dxf`);
    const glbPath = path.join(__dirname, "../../public/models", `${fileName}.glb`);

    // 1️⃣ DWG → DXF  (correct LibreDWG usage)
    // Must run inside uploads folder because dwg2dxf outputs file.dxf automatically
    const dwgCmd = `cd ${uploadsDir} && dwg2dxf ${fileName} && mv ${fileName}.dxf ${dxfPath}`;

    // 2️⃣ DXF → GLB (Assimp)
    const glbCmd = `assimp export "${dxfPath}" "${glbPath}"`;

    // 3️⃣ Optimize GLB
    const optimizeCmd = `gltf-pipeline -i "${glbPath}" -o "${glbPath}"`;

    console.log("Running:", dwgCmd);

    exec(dwgCmd, (err, stdout, stderr) => {
      console.log("DWG2DXF:", stdout, stderr);

      if (err || !fs.existsSync(dxfPath)) {
        return res.status(500).json({
          error: "DWG → DXF conversion failed",
          details: stderr.toString()
        });
      }

      exec(glbCmd, (err, stdout, stderr) => {
        console.log("DXF2GLB:", stdout, stderr);

        if (err || !fs.existsSync(glbPath)) {
          return res.status(500).json({
            error: "DXF → GLB conversion failed",
            details: stderr.toString()
          });
        }

        exec(optimizeCmd, (err, stdout, stderr) => {
          console.log("Optimize:", stdout, stderr);

          // Optimization errors aren't fatal
          return res.json({
            status: "success",
            glb_url: `/models/${fileName}.glb`
          });
        });
      });
    });
  } catch (e) {
    return res.status(500).json({ error: "Unexpected error", details: e.toString() });
  }
});

module.exports = router;

