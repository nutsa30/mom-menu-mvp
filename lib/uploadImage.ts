export async function uploadImage(file: File): Promise<string> {
  // Get signature from our server
  const signRes = await fetch('/api/upload/sign');
  if (!signRes.ok) throw new Error('Could not get upload signature');
  const { cloudName, apiKey, timestamp, signature, folder } = await signRes.json();

  // Upload directly from browser to Cloudinary (no server proxy, no size limit)
  const fd = new FormData();
  fd.append('file', file);
  fd.append('api_key', apiKey);
  fd.append('timestamp', timestamp);
  fd.append('signature', signature);
  fd.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: fd,
  });

  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message ?? 'Upload failed');
  return data.secure_url;
}
