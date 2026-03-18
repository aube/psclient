const CLIENT_SERVICE_API_KEY = process.env.CLIENT_SERVICE_API_KEY;

export async function sendStringAsFile(
  url,
  content,
  filename,
  options,
) {
  if (!filename) {
    throw Error("filename is empty")
  }
  
  const mimeType = options?.mimeType || 'text/plain'
  const method = options?.method || 'POST'
  const blob = new Blob([content], { type: mimeType });
  const formData = new FormData();

  formData.append('file', blob, filename);
  formData.append('description', 'generated css');
  formData.append('category', 'css');
  formData.append('url', '/' + filename);

  const response = await fetch(url, {
    method,
    headers: {
      ...(options?.headers || {}),
      "x-client-service-key": CLIENT_SERVICE_API_KEY,
    },
    body: formData
  });

  return response.json();
}
