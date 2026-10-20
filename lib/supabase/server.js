import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Normalisasi URL Supabase jika user memasukkan trailing slash atau URL REST.
 */
function normalizeSupabaseUrl(rawUrl) {
  if (!rawUrl) return "";
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

/**
 * Membuat koneksi Supabase di server menggunakan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca katalog dan detail produk (pengunjung).
 */
export function createServerClient() {
  const rawUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!rawUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY harus diisi di environment variable."
    );
  }

  const supabaseUrl = normalizeSupabaseUrl(rawUrl);

  return createSupabaseClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createClient = createServerClient;
