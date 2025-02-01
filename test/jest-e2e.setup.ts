import { execSync } from "child_process";

export default async () => {
  console.log("\nRunning migrations");
  execSync("npm run migration:run:test");
};
