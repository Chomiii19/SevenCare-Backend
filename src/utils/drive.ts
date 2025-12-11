import { google, drive_v3 } from "googleapis";
import fs from "fs";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;
if (!serviceAccountJson) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT environment variable");
}

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(serviceAccountJson),
  scopes: SCOPES,
});

const driveService = google.drive({ version: "v3", auth });

export async function uploadToDrive(
  filePath: string,
  fileName: string,
  folderId?: string,
): Promise<string> {
  const fileMetadata: drive_v3.Schema$File = { name: fileName };
  if (folderId) fileMetadata.parents = [folderId];

  const media = { body: fs.createReadStream(filePath) };

  const response = await driveService.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: "id",
  });

  fs.unlinkSync(filePath);

  return (response.data as drive_v3.Schema$File).id!;
}

export async function deleteFromDrive(fileId: string): Promise<void> {
  try {
    await driveService.files.delete({ fileId });
    console.log(`Deleted file from Drive: ${fileId}`);
  } catch (error) {
    console.error("Failed to delete file from Drive:", error);
    throw new Error("Drive deletion failed");
  }
}
