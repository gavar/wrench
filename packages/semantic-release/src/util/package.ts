import { readFile } from "fs";
import { promisify } from "util";

const readFileAsync = promisify(readFile);

export interface Package {
  version: string;
  private: boolean;
  release: boolean | object;
}

/**
 * Reads {@link Package} by provided path.
 * @param file - path to a file.
 * @param strict - whether to strictly validate package contents.
 * @return package info by the provided path.
 */
export async function packageByPath<T extends Package = Package>(file: string, strict: boolean = true): Promise<T> {
  try {
    const text = await readFileAsync(file);
    return JSON.parse(text.toString());

  } catch (e) {
    console.error("unable to parse package:", file);
    throw e;
  }
}
