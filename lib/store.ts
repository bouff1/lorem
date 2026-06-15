// =============================================================================
//  Stockage abstrait : Upstash Redis (KV) si configuré (Vercel), sinon
//  repli sur des fichiers JSON locaux (dev / Docker).
// =============================================================================

import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const useKV = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const dataDir = process.env.RIOT_DATA_DIR ?? path.join(process.cwd(), "data");
const filePath = (key: string) => path.join(dataDir, `riot-${key}.json`);

let redis: Redis | null = null;
function getRedis(): Redis {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

export function storageMode(): "kv" | "file" {
  return useKV ? "kv" : "file";
}

export async function readJSON<T>(key: string): Promise<T | null> {
  if (useKV) {
    return (await getRedis().get<T>(`riot:${key}`)) ?? null;
  }
  try {
    return JSON.parse(await fs.readFile(filePath(key), "utf8")) as T;
  } catch {
    return null; // pas encore de données
  }
}

export async function writeJSON<T>(key: string, data: T): Promise<void> {
  if (useKV) {
    await getRedis().set(`riot:${key}`, data);
    return;
  }
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(filePath(key), JSON.stringify(data), "utf8");
}
