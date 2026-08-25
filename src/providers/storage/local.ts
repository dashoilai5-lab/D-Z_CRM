import * as fs from "node:fs";
import * as path from "node:path";
import type { StorageProvider } from "../types";

/** LocalStorageProvider — files under ./storage (prototype stand-in for Supabase Storage). */
export class LocalStorageProvider implements StorageProvider {
  readonly name = "local-storage";
  private dir = path.join(process.cwd(), "storage");

  private ensureDir() {
    fs.mkdirSync(this.dir, { recursive: true });
  }

  async put(key: string, data: Uint8Array, contentType: string): Promise<string> {
    this.ensureDir();
    const safe = key.replace(/[^a-zA-Z0-9._-]/g, "_");
    const file = path.join(this.dir, safe);
    fs.writeFileSync(file, data);
    return "/api/storage/" + safe + (contentType === "image/jpeg" ? "" : "");
  }

  async get(key: string): Promise<Uint8Array | null> {
    this.ensureDir();
    const safe = key.replace(/[^a-zA-Z0-9._-]/g, "_");
    const file = path.join(this.dir, safe);
    if (!fs.existsSync(file)) return null;
    return fs.readFileSync(file);
  }
}

export const storageProvider = new LocalStorageProvider();
