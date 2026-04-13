import fs from "node:fs/promises";
import path from "node:path";

export function formatMs(ms: number): string {
  return (ms / 1000).toFixed(2) + "s";
}

export async function getFileSize(filePath: string): Promise<{
  size: number;
}> {
  const { size } = await fs.stat(filePath);
  return { size };
}

// AI GENERATED
/**
 * Walks up the directory tree to find and parse the nearest package.json.
 * @param startDir The directory to start searching from. Defaults to process.cwd().
 * @returns A promise resolving to the parsed package.json, or null if not found.
 */
export async function readHostPackageJson<
  T = {
    name?: string;
    description?: string;
  },
>(startDir: string = process.cwd()): Promise<T | null> {
  let currentDir: string = startDir;

  while (true) {
    const pkgPath: string = path.join(currentDir, "package.json");

    try {
      // Check if the file exists (fs.stat throws if it doesn't)
      await fs.stat(pkgPath);

      // If we didn't throw, read and parse it
      const fileContent: string = await fs.readFile(pkgPath, "utf8");
      return JSON.parse(fileContent) as T;
    } catch (error: unknown) {
      // Safely cast the error to check Node-specific error codes
      const err = error as NodeJS.ErrnoException;

      if (err.code !== "ENOENT") {
        throw error; // Re-throw permission errors, etc.
      }

      // File not found, go up one directory
      const parentDir: string = path.dirname(currentDir);

      // If we reached the root of the file system, stop searching
      if (parentDir === currentDir) {
        return null;
      }

      currentDir = parentDir;
    }
  }
}

// AI GENERATED
/**
 * Ensures a directory is empty by deleting it entirely and recreating it.
 * @param dirPath The path to the directory
 */
export async function resetDir(dirPath: string): Promise<void> {
  // force: true means it WON'T throw an error if the folder doesn't exist yet
  await fs.rm(dirPath, { recursive: true, force: true });

  // recursive: true creates any missing parent folders (e.g., creates 'src' if you ask for 'src/assets')
  await fs.mkdir(dirPath, { recursive: true });
}
