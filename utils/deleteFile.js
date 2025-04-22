// In-built node module
import fs from "fs";

// Function to delete a file
export default async function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
    }
  });
}
