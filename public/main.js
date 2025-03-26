document.addEventListener("DOMContentLoaded", () => {
  async function uploadFile() {
    const fileInput = document.getElementById("fileInput").files[0];
    const status = document.getElementById("status");
    const img = document.getElementById("img");
    if (!fileInput) {
      status.textContent = "Please select a file.";
      return;
    }
    const formData = new FormData();
    formData.append("file", fileInput);
    status.textContent = "Uploading...";
    const resultToImageSrc = (result) => {
      const arr = new Uint8Array(Object.values(result.imgData));
      const blob = new Blob([arr.buffer], { type: "image/png" });
      const src = URL.createObjectURL(blob);
      return src;
    };
    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      status.textContent = result.message || "Upload successful!";
      img.src = resultToImageSrc(result);
    } catch (e) {
      status.textContent = e.error;
      console.error(e);
    }
  }

  document.querySelector("#upload").addEventListener("click", () => {
    uploadFile();
  });
});
