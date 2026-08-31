"use client";

import React from "react";
import AuthShell from "../../Auth/AuthShell";
import RegisterForm from "../../Auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthShell mode="register">
      <RegisterForm />
    </AuthShell>
  );
}
