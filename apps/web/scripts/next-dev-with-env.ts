import { spawn } from "node:child_process";
import { loadLocalEnvFiles } from "../lib/env-loader";

loadLocalEnvFiles();

const args = process.argv.slice(2).filter((arg) => arg !== "--");

const child = spawn("next", ["dev", ...args], {
  env: process.env,
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
