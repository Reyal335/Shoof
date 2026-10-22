import { NetworkError } from "@/lib/api-client";
import { authedRequest } from "@/features/auth/authed-request";

type UploadSlot = { key: string; url: string };

/** POST /uploads: a 5-minute URL to PUT one image to, and the key to send with the post. */
const requestUpload = (contentType: string) =>
  authedRequest<UploadSlot>("/uploads", { method: "POST", body: { contentType } });

/** PUTs one file straight to storage. Plain fetch: this goes to S3, not our API, so no token, cookies or JSON. */
async function putFile(url: string, file: File) {
  let res: Response;
  try {
    res = await fetch(url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  } catch {
    throw new NetworkError();
  }
  if (!res.ok) throw new Error(`Upload of ${file.name} failed (${res.status})`);
}

/** Uploads the screenshots in parallel and returns their keys in the same order, so the cover stays first. */
export function uploadScreenshots(files: File[]): Promise<string[]> {
  return Promise.all(
    files.map(async (file) => {
      const { key, url } = await requestUpload(file.type);
      await putFile(url, file);
      return key;
    }),
  );
}
