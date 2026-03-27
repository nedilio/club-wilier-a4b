"use client";

import { LoginForm } from "@/components/login-form";
import { LoginContainer } from "@/components/login/login-container";
import { LoginCardWrapper } from "@/components/login/login-card-wrapper";

export function LoginClient() {
  return (
    <LoginContainer>
      <LoginCardWrapper>
        <LoginForm />
      </LoginCardWrapper>
    </LoginContainer>
  );
}
