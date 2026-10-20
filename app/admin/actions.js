"use server";

import { redirect } from "next/navigation";
import { createAdminSessionClient } from "@/lib/supabase/server";

export async function login(prevState, formData) {
  // Mendukung form action langsung maupun useActionState
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get?.("email")?.toString().trim() ?? "";
  const password = data?.get?.("password")?.toString() ?? "";

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let authError = null;

  try {
    const supabase = await createAdminSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      authError = error;
    }
  } catch (err) {
    authError = err;
  }

  if (authError) {
    if (authError.message === "Invalid login credentials") {
      return { error: "Email atau password salah. Silakan periksa kembali." };
    }
    return {
      error: authError.message || "Gagal masuk. Silakan coba lagi.",
    };
  }

  redirect("/admin");
}

export async function logout() {
  try {
    const supabase = await createAdminSessionClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Gagal keluar:", err);
  }

  redirect("/admin/login");
}

