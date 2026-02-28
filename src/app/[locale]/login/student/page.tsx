"use client";

import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/LoginForm";

export default function StudentLoginPage() {
  const t = useTranslations("auth");

  return (
    <div className="py-12">
      <LoginForm
        role="student"
        title={t("loginTitle")}
        signUpTitle={t("signUpTitle")}
        emailLabel={t("email")}
        passwordLabel={t("password")}
        loginButton={t("login")}
        signUpButton={t("signUp")}
        noAccount={t("noAccount")}
        hasAccount={t("hasAccount")}
        authError={t("authError")}
        signUpSuccess={t("signUpSuccess")}
        displayNameLabel={t("displayName")}
        forgotPassword={t("forgotPassword")}
        wrongLoginType={t("wrongLoginTypeStudent")}
      />
    </div>
  );
}
