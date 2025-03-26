const express = require("express");
const multer = require("multer");
const { PinataSDK } = require("pinata");
require("dotenv").config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const fileBufferToUint8Array = async (fileBuffer) => {
    const blob = new Blob([fileBuffer]);
    const file = new File([blob], "jakis-image.png", { type: "image/png" });
    const uploadMetadata = await pinata.upload.public.file(file);
    const uploadBlob = await pinata.gateways.private.get(uploadMetadata.cid);
    const uploadBlobStreamUint8Array = await uploadBlob.data
      .stream()
      .getReader()
      .read();

    return uploadBlobStreamUint8Array.value;
  };

  try {
    res.json({ imgData: await fileBufferToUint8Array(req.file.buffer) });
  } catch (error) {
    res.status(500).json({ error, msg: "Upload failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
