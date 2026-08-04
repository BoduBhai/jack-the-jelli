import type { Metadata } from "next";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | Jack The Jelli",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
