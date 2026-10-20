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

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data?.get?.("password_baru")?.toString() ?? "";
  const konfirmasiPassword = data?.get?.("konfirmasi_password")?.toString() ?? "";

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password wajib diisi." };
  }

  if (passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak sama." };
  }

  // Wajib periksa bahwa admin sudah login di server sebelum mengubah data
  const supabase = await createAdminSessionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi login tidak valid atau sudah berakhir. Silakan login kembali." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (updateError) {
    return {
      error: updateError.message || "Gagal mengganti password. Silakan coba lagi.",
    };
  }

  return { success: "Password berhasil diganti." };
}
