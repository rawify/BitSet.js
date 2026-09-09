import { rm } from 'node:fs/promises';

await Promise.all([
  rm('.types', { force: true, recursive: true }),
  rm('dist', { force: true, recursive: true }),
]);