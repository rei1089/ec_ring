import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

export async function signInWithEmail(email: string) {
  if (!supabase) {
    return { error: new Error("Supabaseが設定されていません") };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { error };
}

export async function signOut() {
  if (!supabase) {
    return { error: new Error("Supabaseが設定されていません") };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function createUserProfile(
  userId: string,
  locale: string = "en",
  homeCountry?: string
) {
  if (!supabase) {
    return { error: new Error("Supabaseが設定されていません") };
  }

  const { error } = await supabase.from("user_profiles").insert({
    id: userId,
    locale,
    home_country: homeCountry,
  });
  return { error };
}

export async function getUserProfile(userId: string) {
  if (!supabase) {
    return { data: null, error: new Error("Supabaseが設定されていません") };
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
}

export async function updateUserProfile(
  userId: string,
  updates: { locale?: string; home_country?: string }
) {
  if (!supabase) {
    return { error: new Error("Supabaseが設定されていません") };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", userId);

  return { error };
}
