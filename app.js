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
const upload = multer({ storage: multer.memoryStorage() });

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

app.get("/", async (request, response) => {
  response.send(`
<!DOCTYPE html>
<html lang="en">
<head>
 <​meta charset="UTF-8">
 <​meta name="viewport" content="width=device-width, initial-scale=1.0">
 <title>File Upload (Fetch API)</title>
</head>
<body>
 <h2>Upload a File</h2>
 <input type="file" id="fileInput">
 <button onclick​="uploadFile()">Upload</button>
 <p id="status"></p>
 <img id="img" />

 <​script>
 async function uploadFile() {
 const fileInput = document.getElementById('fileInput').files[0];
 const status = document.getElementById('status');
 const img = document.getElementById('img');

 if (!fileInput) {
 status.textContent = "Please select a file.";
 return;
 }

 const formData = new FormData();
 formData.append("file", fileInput);

 status.textContent = "Uploading...";

 const resultToImageSrc = (result) => {
 const arr = new Uint8Array(Object.values(result.imgData));
 const blob = new Blob([arr.buffer], {type: "image/png"});
 const src = URL.createObjectURL(blob);
 return src;
 }

 try {
 const response = await fetch('/upload', {
 method: "POST",
 body: formData
 });

 const result = await response.json();
 status.textContent = result.message || "Upload successful!";

 img.src = resultToImageSrc(result)
 } catch (e) {
 status.textContent = e.error;
 console.error(e);
 }
 }
 <​/script>
</body>
</html>
 `);
});

app.post("/upload", upload.single("file"), async (request, response) => {
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
    response.json({
      imgData: await fileBufferToUint8Array(request.file.buffer),
    });
  } catch (error) {
    response.status(500).json({ error, msg: "Upload failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
