import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputDir = 'artifacts';
fs.mkdirSync(outputDir, { recursive: true });
const archivePath = path.join(outputDir, `playwright-artifacts-${timestamp}.zip`);

const archive = archiver('zip', { zlib: { level: 9 } });
archive.directory('playwright-report', 'playwright-report', false);
archive.directory('test-results', 'test-results', false);

const stream = fs.createWriteStream(archivePath);
archive.pipe(stream);
await archive.finalize();

console.log(`Wrote ${archivePath}`);
