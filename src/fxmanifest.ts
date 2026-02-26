import { readJson } from "./readJson.js"
import { writeFile } from "fs/promises";

/**
 * Reduces an array into a formatted string.
 * @param name - The name of the section.
 * @param files - The array of file names.
 * @returns The reduced string or an empty string if the array is empty.
 */
function reduceArray(name: string, files?: string[]): string {
  return files?.[0]
    ? `\n${name} {${files.reduce((acc, value) => {
      return value ? `${acc}\n\t'${value}',` : acc;
    }, "")}\n}\n`
    : "";
}

/**
 * Reduces an object into a formatted string.
 * @param object - The object to reduce.
 * @returns The reduced string.
 */
function reduceObject(object: Record<string, string>): string {
  return Object.entries(object).reduce((acc, [key, value]) => {
    return value ? `${acc}${key} '${value}'\n` : acc;
  }, "");
}

/**
 * Represents a Resource Manifest.
 */
interface FxResourceManifest {
  client_scripts?: string[];
  server_scripts?: string[];
  shared_scripts?: string[];
  files?: string[];
  dependencies?: string[];
  metadata?: Record<string, string>;
}

/**
 * Creates the `fxmanifest.lua` file based on the resource manifest.
 * @param resourceManifest - The resource manifest containing script and file information.
 * @returns The generated `fxmanifest.lua` content as a string.
 */
export async function createFxmanifest({
  client_scripts,
  server_scripts,
  shared_scripts,
  files,
  dependencies,
  metadata,
}: FxResourceManifest): Promise<string> {
  const pkg = await readJson("package.json");
  const fxmanifest = {
    name: pkg.name,
    author: pkg.author,
    version: pkg.version,
    license: pkg.license,
    repository: pkg.repository?.url,
    description: pkg.description,
    fx_version: "cerulean",
    game: "gta5",
    ...(metadata || {}),
  };

  let output = reduceObject(fxmanifest);
  output += reduceArray("files", files);
  output += reduceArray("dependencies", dependencies);
  output += reduceArray("client_scripts", client_scripts);
  output += reduceArray("server_scripts", server_scripts);
  output += reduceArray("shared_scripts", shared_scripts);

  await writeFile("fxmanifest.lua", output);

  return output;
}
