const CLIENT_SERVICE_API_KEY = process.env.CLIENT_SERVICE_API_KEY;

export async function sendJSON(url, data, method = 'POST') {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();

  if (result.error) {
    throw new Error(result.message)
  }

  return result
}