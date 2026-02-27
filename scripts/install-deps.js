import { execSync } from 'child_process';

try {
  console.log('[v0] Running npm install to regenerate package-lock.json...');
  execSync('npm install', { cwd: '/vercel/share/v0-project', stdio: 'inherit' });
  console.log('[v0] Successfully regenerated package-lock.json');
} catch (error) {
  console.error('[v0] Error running npm install:', error.message);
  process.exit(1);
}
