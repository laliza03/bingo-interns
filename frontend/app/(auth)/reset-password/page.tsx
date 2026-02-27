import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Reset Password | Internship Bingo",
};

export default function ResetPasswordPage() {
  return (
    <div className="auth-card">
      <p className="eyebrow" style={{ textAlign: "center" }}>
        INTELCOM INTERNSHIP BINGO
      </p>
      <h1 className="welcome-title">Reset your password</h1>
      <p className="intro-text">
        Enter your new password below.
      </p>
      <ResetPasswordForm />
    </div>
  );
}
