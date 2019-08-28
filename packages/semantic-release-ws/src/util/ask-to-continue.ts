import { prompt } from "inquirer";
import { WsConfiguration } from "../types";

export function shouldAskToContinue(options: WsConfiguration): boolean {
  return !options.confirm && !options.confirm;
}

export async function askToContinue(message: string = "do you want to continue?"): Promise<void> {
  const answers: Record<"ok", boolean> = await prompt({
    type: "confirm",
    name: "ok",
    message,
  });

  if (!answers.ok) {
    console.error("abort by user");
    process.exit(1);
  }
}
