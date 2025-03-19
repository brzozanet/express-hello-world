// const { PinataSDK } = require("pinata");
// const fs = require("fs");
// const { Blob } = require("buffer");
// require("dotenv").config();

// const pinata = new PinataSDK({
//   pinataJwt: process.env.PINATA_JWT,
//   pinataGateway: process.env.GATEWAY_URL,
// });

// async function upload() {
//   try {
//     const blob = new Blob([fs.readFileSync("./upload/sample-photo.jpg")]);
//     const file = new File([blob], "sample-photo.jpg", {
//       type: "image/jpeg",
//     });
//     const upload = await pinata.upload.public.file(file);
//     console.log(upload);

//     const file2 = await pinata.gateways.private.get(upload.cid);
//     console.log(file2.data);
//   } catch (error) {
//     console.log(error);
//   }
// }

// upload();

const express = require("express");
const multer = require("multer");
const { PinataSDK } = require("pinata");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const upload = await pinata.upload.public.file(file);
    console.log(upload);

    const file2 = await pinata.gateways.private.get(upload.cid);
    console.log(file2.data);

    res.json({ blob: file2.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
