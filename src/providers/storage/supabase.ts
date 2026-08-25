import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { StorageProvider } from "../types";

/**
 * SupabaseStorageProvider — production storage (bucket: dz-assets).
 * put: service-role upload to private bucket, returns public URL;
 * get: fetch via public URL (bucket must be public, or add RLS policy).
 */
export class SupabaseStorageProvider implements StorageProvider {
  readonly name = "supabase-storage";
  private bucket = process.env.STORAGE_BUCKET ?? "dz-assets";
  private client: SupabaseClient;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      throw new Error("SupabaseStorageProvider: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required");
    }
    this.client = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  async put(key: string, data: Uint8Array, contentType: string): Promise<string> {
    const { error } = await this.client.storage.from(this.bucket).upload(key, data, {
      contentType,
      upsert: true,
    });
    if (error) throw new Error(`SupabaseStorage.put ${key}: ${error.message}`);
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    return `${base}/storage/v1/object/public/${this.bucket}/${key}`;
  }

  async get(key: string): Promise<Uint8Array | null> {
    const { data, error } = await this.client.storage.from(this.bucket).download(key);
    if (error || !data) return null;
    return new Uint8Array(await data.arrayBuffer());
  }
}

export const storageProvider = new SupabaseStorageProvider();
