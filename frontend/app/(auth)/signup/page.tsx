import SignupForm from "@/components/auth/SignupForm";

export const metadata = {
  title: "Sign Up | Internship Bingo",
};

export default function SignupPage() {
  return (
    <div className="auth-card">
      <p className="eyebrow" style={{ textAlign: "center" }}>
        INTELCOM INTERNSHIP BINGO
      </p>
      <h1 className="welcome-title">Join the fun!</h1>
      <p className="intro-text">
        Create your account to start tracking activities and complete your
        Intelcom Internship Bingo board. May the odds be ever in your favor.
      </p>
      <SignupForm />
    </div>
  );
}
