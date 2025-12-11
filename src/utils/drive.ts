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
): Promise<string> {
  const folderId = await getOrCreateFolder("Medical Records");

  const fileMetadata: drive_v3.Schema$File = {
    name: fileName,
    parents: [folderId],
  };
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

async function getOrCreateFolder(folderName: string): Promise<string> {
  const res = await driveService.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
    fields: "files(id, name)",
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  const folder = await driveService.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  return folder.data.id!;
}
