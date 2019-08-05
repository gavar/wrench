import { OutputAsset, OutputChunk } from "rollup";

export function isOutputChunk(chunk: OutputAsset | OutputChunk): chunk is OutputChunk {
  return chunk && !(chunk as OutputAsset).isAsset;
}

export function isOutputChunkWithId(chunk: OutputAsset | OutputChunk, id: string): boolean {
  if (isOutputChunk(chunk))
    if (chunk.facadeModuleId === id)
      return true;
}
