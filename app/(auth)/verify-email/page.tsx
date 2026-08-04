import type { Metadata } from "next";
import VerifyEmailNotice from "@/features/auth/components/VerifyEmailNotice";

export const metadata: Metadata = {
  title: "Verify Email | Jack The Jelli",
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ email?: string; error?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { email, error } = await searchParams;
  return <VerifyEmailNotice email={email} error={error} />;
}
