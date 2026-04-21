import { readdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const cjsDir = path.resolve("dist", "cjs");

async function main() {
  const entries = await readdir(cjsDir, { withFileTypes: true });

  const jsFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .map((entry) => entry.name);

  for (const fileName of jsFiles) {
    const from = path.join(cjsDir, fileName);
    const to = path.join(cjsDir, fileName.replace(/\.js$/, ".cjs"));

    try {
      await unlink(to);
    } catch {
      // Target might not exist; ignore.
    }

    await rename(from, to);
  }

  const cjsFiles = jsFiles.map((fileName) => fileName.replace(/\.js$/, ".cjs"));

  for (const fileName of cjsFiles) {
    const fullPath = path.join(cjsDir, fileName);
    const content = await readFile(fullPath, "utf8");

    const updated = content.replace(
      /require\("(\.[^\"]+)\.js"\)/g,
      'require("$1.cjs")'
    );

    if (updated !== content) {
      await writeFile(fullPath, updated, "utf8");
    }
  }
}

main().catch((err) => {
  console.error("Failed to normalize CommonJS extensions:", err);
  process.exit(1);
});
