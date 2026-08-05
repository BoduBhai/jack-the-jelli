import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-guard";
import RegisterForm from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | Jack The Jelli",
};

export default async function RegisterPage() {
  // A signed-in visitor can't create a second account from this form — the
  // sign-up call would just fail against their own session's email.
  const session = await getSession();
  if (session) redirect("/");

  return <RegisterForm />;
}
