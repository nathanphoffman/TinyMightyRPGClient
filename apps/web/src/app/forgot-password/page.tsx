"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ForgotPasswordInput } from "@tmrpg/schemas";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nestApi } from "@/lib/api/nest-client";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ForgotPasswordInput),
  });

  const forgotPassword = useMutation({
    mutationFn: nestApi.forgotPassword,
  });

  return (
    <main className="flex flex-1 items-center justify-center p-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
        </CardHeader>
        <CardContent>
          {forgotPassword.isSuccess ? (
            <p className="text-sm text-muted-foreground">
              If an account exists for that email, we&apos;ve sent a link to reset your password.
            </p>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit((values) => forgotPassword.mutate(values))}
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              {forgotPassword.isError && (
                <p className="text-sm text-destructive">Something went wrong. Try again.</p>
              )}

              <Button type="submit" disabled={forgotPassword.isPending}>
                {forgotPassword.isPending ? "Sending…" : "Send reset link"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="underline underline-offset-4">
                  Back to log in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
