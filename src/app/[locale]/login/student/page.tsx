"use client";

import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/LoginForm";

export default function StudentLoginPage() {
  const t = useTranslations("auth");
  const tSignup = useTranslations("signup");

  return (
    <div className="py-12">
      <LoginForm
        role="student"
        title={t("loginTitle")}
        roleBadge={tSignup("studentLabel")}
        emailLabel={t("email")}
        passwordLabel={t("password")}
        loginButton={t("login")}
        authError={t("authError")}
        forgotPassword={t("forgotPassword")}
        wrongLoginType={t("wrongLoginTypeStudent")}
        noAccount={t("noAccount")}
        signUpLink={t("signUp")}
      />
    </div>
  );
}
