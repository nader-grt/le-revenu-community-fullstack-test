
"use client";

import { useEffect, useState } from "react";
import { API_URL, getErrorMessage, type StrapiErrorResponse } from "../lib/api";

interface LoginResponse extends StrapiErrorResponse {
  jwt?: string;
  user?: {
    username?: string;
    email?: string;
  };
}

export function useDiscussionAuth() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    setToken(sessionStorage.getItem("discussionJwt") || "");
    setUsername(sessionStorage.getItem("discussionUsername") || "");
  }, []);

  async function handleLogin() {
    setAuthError("");

    if (!email.trim() || !password) {
      setAuthError("Veuillez saisir votre email et votre mot de passe.");
      return;
    }

    setLoggingIn(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: email.trim(),
          password,
        }),
      });

      const body = (await response.json()) as LoginResponse;

      if (!response.ok || !body.jwt) {
        throw new Error(
          getErrorMessage(body, "Connexion impossible. Vérifiez vos identifiants."),
        );
      }

      const loggedInUsername =
        body.user?.username ?? body.user?.email ?? email.trim();

      sessionStorage.setItem("discussionJwt", body.jwt);
      sessionStorage.setItem("discussionUsername", loggedInUsername);

      setToken(body.jwt);
      setUsername(loggedInUsername);
      setPassword("");
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant la connexion.",
      );
    } finally {
      setLoggingIn(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("discussionJwt");
    sessionStorage.removeItem("discussionUsername");
    setToken("");
    setUsername("");
    setPassword("");
    setAuthError("");
  }

  return {
    token,
    username,
    email,
    setEmail,
    password,
    setPassword,
    authError,
    loggingIn,
    handleLogin,
    handleLogout,
  };
}
