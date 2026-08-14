"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ResetPasswordInput } from "@tmrpg/schemas";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nestApi } from "@/lib/api/nest-client";

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";

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
        This reset link is missing its token. Request a new one from the{" "}
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
        <p className="text-sm text-destructive">
          This reset link is invalid or has expired. Request a new one.
        </p>
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
