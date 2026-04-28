import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

export function getLocalEnvFileCandidates(cwd = process.cwd()) {
  return [
    resolve(/* turbopackIgnore: true */ cwd, "../../.env"),
    resolve(/* turbopackIgnore: true */ cwd, ".env")
  ];
}

export function loadLocalEnvFiles(cwd = process.cwd()) {
  const loadedPaths: string[] = [];

  for (const envPath of getLocalEnvFileCandidates(cwd)) {
    if (existsSync(envPath)) {
      config({ path: envPath, override: false, quiet: true });
      loadedPaths.push(envPath);
    }
  }

  return loadedPaths;
}
