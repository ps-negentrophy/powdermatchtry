"use client";

import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/LoginForm";

export default function InstructorLoginPage() {
  const t = useTranslations("auth");
  const tSignup = useTranslations("signup");

  return (
    <div className="py-12">
      <LoginForm
        role="instructor"
        title={t("loginTitleInstructor")}
        roleBadge={tSignup("instructorLabel")}
        emailLabel={t("email")}
        passwordLabel={t("password")}
        loginButton={t("login")}
        authError={t("authError")}
        forgotPassword={t("forgotPassword")}
        wrongLoginType={t("wrongLoginTypeInstructor")}
        noAccount={t("noAccount")}
        signUpLink={t("signUp")}
      />
    </div>
  );
}
