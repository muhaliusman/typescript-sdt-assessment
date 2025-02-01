import { execSync } from "child_process";

export default async () => {
  console.log("\nReverting migrations");
  execSync("npm run migration:revert:test");
};
