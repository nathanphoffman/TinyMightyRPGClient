"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ResetPasswordInput } from "@tmrpg/schemas";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, nestApi } from "@/lib/api/nest-client";


/**
 * A 400 is the API telling us the token itself is no good — the only case where
 * asking for a fresh link helps. Anything else (the API being down, a 500) is our
 * problem, not the link's, and saying "expired" would send the user off to request
 * another link that fails the same way.
 */
function resetErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.isNetworkError) {
      return "Couldn't reach the server. Check that the API is running, then try again.";
    }
    if (error.status === 400) {
      return "This reset link is invalid or has expired. Request a new one.";
    }
  }
  return "Something went wrong resetting your password. Try again.";
}

function useTokenRemovedFromUrl() {

  const searchParams = useSearchParams();

  // Snapshot the token on first render, then strip it from the address bar. The
  // form keeps working off this copy, while the URL left behind in history and in
  // any Referer header no longer carries a live credential.

  // HUMAN: I saw a potential security flaw here because the token was not removed this does that
  const [token] = useState(() => searchParams.get("token") ?? "");

  useEffect(() => {
    if (searchParams.has("token")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams]);

  return token;
}

function ResetPasswordForm() {
  const router = useRouter();
  const token = useTokenRemovedFromUrl();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ResetPasswordInput),
    defaultValues: { token, password: "" },
  });

  const resetPassword = useMutation({
    mutationFn: nestApi.resetPassword,
    onSuccess: () => router.push("/login"),
  });

  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">
        This reset link is missing its token. If you refreshed this page, open the link
        from your email again. Otherwise request a new one from the{" "}
        <Link href="/forgot-password" className="underline underline-offset-4">
          forgot password
        </Link>{" "}
        page.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((values) => resetPassword.mutate({ ...values, token }))}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">New password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {resetPassword.isError && (
        <p className="text-sm text-destructive">{resetErrorMessage(resetPassword.error)}</p>
      )}

      <Button type="submit" disabled={resetPassword.isPending}>
        {resetPassword.isPending ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Choose a new password</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}