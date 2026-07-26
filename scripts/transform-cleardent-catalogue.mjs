#!/usr/bin/env node

import { constants as fsConstants } from "node:fs";
import {
  access,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transformClearDentCatalogue } from "./lib/cleardent-catalogue-transform.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const privateRoot = path.join(repositoryRoot, "private");

function usage() {
  return [
    "Usage:",
    "  npm run catalogue:from-cleardent -- --input private/PRIVATE-cleardent-udf-extraction.json --output private/hygienenote-cleardent-catalogue.json [--force]",
  ].join("\n");
}

function parseArguments(argv) {
  const result = { input: "", output: "", force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--force") {
      result.force = true;
    } else if (argument === "--input" || argument === "--output") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${argument}.\n${usage()}`);
      }
      result[argument.slice(2)] = value;
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argument}.\n${usage()}`);
    }
  }
  if (!result.input || !result.output) {
    throw new Error(usage());
  }
  return result;
}

function resolvePrivatePath(value, label) {
  const resolved = path.resolve(repositoryRoot, value);
  const relative = path.relative(privateRoot, resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} must be a file inside the ignored private/ folder.`);
  }
  return resolved;
}

async function exists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const inputPath = resolvePrivatePath(args.input, "Input");
  const outputPath = resolvePrivatePath(args.output, "Output");
  if (inputPath === outputPath) {
    throw new Error("Input and output files must be different.");
  }
  if (!args.force && (await exists(outputPath))) {
    throw new Error(
      "Output already exists. Choose another path or pass --force explicitly.",
    );
  }

  let extraction;
  try {
    extraction = JSON.parse(await readFile(inputPath, "utf8"));
  } catch (error) {
    throw new Error(
      error instanceof SyntaxError
        ? "The private ClearDent extraction is not valid JSON."
        : "The private ClearDent extraction could not be read.",
    );
  }

  const { exportValue, report } =
    transformClearDentCatalogue(extraction);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify(exportValue, null, 2)}\n`,
    { encoding: "utf8", flag: args.force ? "w" : "wx" },
  );

  const totals = report.reduce(
    (total, item) => ({
      included: total.included + item.included,
      excludedTruncated:
        total.excludedTruncated + item.excludedTruncated,
      excludedDuplicate: total.excludedDuplicate + item.excludedDuplicate,
    }),
    { included: 0, excludedTruncated: 0, excludedDuplicate: 0 },
  );
  process.stdout.write("Private catalogue import created.\n");
  for (const item of report) {
    process.stdout.write(
      `${item.fieldId}: ${item.included} included, ${item.excludedTruncated} unresolved excluded, ${item.excludedDuplicate} duplicates excluded.\n`,
    );
  }
  process.stdout.write(
    `Total: ${totals.included} included, ${totals.excludedTruncated} unresolved excluded, ${totals.excludedDuplicate} duplicates excluded.\n`,
  );
}

main().catch((error) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Catalogue transformation failed."}\n`,
  );
  process.exitCode = 1;
});
