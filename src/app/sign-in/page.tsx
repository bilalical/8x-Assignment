"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AmazonLogo } from "@/components/amazon-logo";
import { useStore } from "@/lib/store";

export default function SignInPage() {
  const router = useRouter();
  const { ready, signedIn, signIn } = useStore();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const nextPath = "/account";

  useEffect(() => {
    if (ready && signedIn) router.replace(nextPath);
  }, [ready, signedIn, router, nextPath]);

  if (!ready) return <div className="container page-shell"><p>Preparing your account…</p></div>;
  if (signedIn) return <div className="container page-shell"><p>Opening your account…</p></div>;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter your name to continue.");
      return;
    }
    const requestedPath = new URLSearchParams(window.location.search).get("next");
    const destination = requestedPath?.startsWith("/") ? requestedPath : nextPath;
    signIn(name);
    router.replace(destination);
  };

  return <div className="container page-shell account-sign-in">
    <Link href="/" className="brand-mark account-sign-in-logo" aria-label="Everyday Market home"><AmazonLogo /></Link>
    <form className="account-card sign-in-card" onSubmit={submit}>
      <h1>Sign in</h1>
      <p className="checkout-hint">This shopping demo keeps account details on this device.</p>
      <label className="field">Your name<input autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary button-wide" type="submit">Continue</button>
      <p className="sign-in-disclaimer">Demo sign-in only. No password or payment information is requested.</p>
    </form>
  </div>;
}
