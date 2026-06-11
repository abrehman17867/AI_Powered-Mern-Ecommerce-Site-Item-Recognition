import React from "react";
import AuthShell from "../../Auth/AuthShell";
import LoginForm from "../../Auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <LoginForm />
    </AuthShell>
  );
}
