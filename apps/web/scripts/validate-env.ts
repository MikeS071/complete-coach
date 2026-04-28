import { loadLocalEnvFiles } from "../lib/env-loader";
import { getServerEnv } from "../lib/env";

loadLocalEnvFiles();
getServerEnv();

console.log("server env ok");
