export async function sendStringAsFile(
  url,
  content,
  filename,
  options,
) {
  if (!filename) {
    throw Error("filename is empty")
  }
  
  const mimeType = options.mimeType || 'text/plain'
  const method = options.method || 'POST'
  const blob = new Blob([content], { type: mimeType });
  const formData = new FormData();

  formData.append('file', blob, filename);

  const response = await fetch(url, {
    method,
    body: formData
  });

  return response.json();
}
