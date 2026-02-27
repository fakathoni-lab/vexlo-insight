import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectRoot = '/vercel/share/v0-project';

console.log('[v0] Generating package-lock.json...');

try {
  process.chdir(projectRoot);
  
  // Run npm install to generate a fresh lock file
  console.log('[v0] Running npm install...');
  execSync('npm install', { 
    stdio: 'inherit',
    env: { ...process.env, npm_config_loglevel: 'warn' }
  });
  
  console.log('[v0] Lock file generated successfully!');
  
  // Verify the lock file exists
  const lockFilePath = path.join(projectRoot, 'package-lock.json');
  if (fs.existsSync(lockFilePath)) {
    console.log('[v0] Lock file verified at:', lockFilePath);
  } else {
    console.error('[v0] Lock file was not created');
    process.exit(1);
  }
} catch (error) {
  console.error('[v0] Error generating lock file:', error.message);
  process.exit(1);
}
