// AI GENERATED
import fs from 'node:fs/promises';
import path from 'node:path';
import { defineServerConfig } from '@modern-js/server-runtime';
import { SW_NAME, WEBAPP_MANIFEST_NAME } from '../sw-config';

const rootDir = path.join(__dirname, '..');

// Read the file and return its buffer
async function readAsset(assetName: string) {
  const filePath = path.join(rootDir, assetName);
  return await fs.readFile(filePath);
}

export default defineServerConfig({
  middlewares: [
    {
      name: 'pwa',
      async handler(c, next) {
        const reqPath = c.req.path.replace(/^\//, '');

        switch (reqPath) {
          case WEBAPP_MANIFEST_NAME:
          case SW_NAME:
            try {
              // 1. Await the async file read
              const fileContent = await readAsset(reqPath);

              // 2. Set the correct Content-Type so the browser understands the file
              const contentType =
                reqPath === WEBAPP_MANIFEST_NAME
                  ? 'application/manifest+json'
                  : 'application/javascript';
              c.header('Content-Type', contentType);

              // 3. Return the body to prevent falling through to the default case
              return c.body(fileContent);
            } catch (error) {
              console.error(`Error reading ${reqPath}:`, error);
              return c.notFound(); // Return a 404 if the file is missing
            }

          default:
            // Ensure you return the next() call
            return await next();
        }
      },
    },
  ],
});
