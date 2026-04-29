const fs = require('fs');
const path = require('path');

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full));
    else if (entry.isFile() && full.endsWith('.js')) files.push(full);
  }
  return files;
}

describe('layering guardrails', () => {
  test('transport layer does not import firebase config directly', () => {
    const transportFiles = listFiles(path.resolve(__dirname, '../src/transport'));
    for (const file of transportFiles) {
      const src = fs.readFileSync(file, 'utf8');
      expect(src).not.toMatch(/config\/firebase/);
    }
  });

  test('domain layer does not import express or firebase', () => {
    const domainFiles = listFiles(path.resolve(__dirname, '../src/domain'));
    for (const file of domainFiles) {
      const src = fs.readFileSync(file, 'utf8');
      expect(src).not.toMatch(/require\(['"]express['"]\)/);
      expect(src).not.toMatch(/firebase/);
    }
  });
});
