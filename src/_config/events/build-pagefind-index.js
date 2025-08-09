import {execSync} from 'node:child_process';

export const buildPagefind = () => {
  console.log('Building Pagefind index...');
  try {
    execSync(`npx pagefind --site dist --glob "**/*.html"`, {
      encoding: 'utf-8',
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('Pagefind build failed: ', error.message);
  }
};