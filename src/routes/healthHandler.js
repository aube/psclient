import fs from 'fs/promises';

let packageJson;

try {
  packageJson = await fs.readFile('./package.json', 'utf-8').then(JSON.parse);
} catch (error) {
  console.error('Error reading package.json:', error.message);
  process.exit(1);
}

export const healthHandler = (req, res) => {
  res.json({
    status: "ok",
    service: packageJson.name,
    timestamp: Date.now()
  });
};