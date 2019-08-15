import { Context } from "@wrench/semantic-release";
import { Project, Projects } from "./types";

/** Shared project instances. */
export const projects: Projects = {};

/** Get {@link Project} associated with provided context. */
export function projectByContext({cwd}: Context): Project {
  return projects[cwd];
}
