const WORKER_URL = process.env.R2_WORKER_URL!;
const UPLOAD_SECRET = process.env.R2_UPLOAD_SECRET!;

export async function uploadToR2(
  key: string,
  body: Blob | ReadableStream,
  contentType: string
): Promise<void> {
  const res = await fetch(`${WORKER_URL}/${key}`, {
    method: "PUT",
    body,
    headers: {
      "Content-Type": contentType,
      "X-Upload-Secret": UPLOAD_SECRET,
    },
  });
  if (!res.ok) {
    throw new Error(`R2 upload failed: ${res.status}`);
  }
}

export async function deleteR2Object(key: string): Promise<void> {
  const res = await fetch(`${WORKER_URL}/${key}`, {
    method: "DELETE",
    headers: {
      "X-Upload-Secret": UPLOAD_SECRET,
    },
  });
  if (!res.ok) {
    throw new Error(`R2 delete failed: ${res.status}`);
  }
}

export function publicUrl(key: string): string {
  return `${WORKER_URL}/${key}`;
}

export function keyFromUrl(url: string): string {
  const base = WORKER_URL.replace(/\/$/, "");
  const prefix = base + "/";
  if (!url.startsWith(prefix)) {
    throw new Error(`URL does not belong to this R2 bucket: ${url}`);
  }
  return url.slice(prefix.length);
}
