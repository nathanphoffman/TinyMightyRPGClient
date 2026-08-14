"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoginInput } from "@tmrpg/schemas";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nestApi } from "@/lib/api/nest-client";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginInput),
  });

  const login = useMutation({
    mutationFn: nestApi.login,
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
      router.push("/characters");
    },
  });

  return (
    <main className="flex flex-1 items-center justify-center p-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((values) => login.mutate(values))}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {login.isError && <p className="text-sm text-destructive">Invalid credentials.</p>}

            <Button type="submit" disabled={login.isPending}>
              {login.isPending ? "Logging in…" : "Log in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/forgot-password" className="underline underline-offset-4">
                Forgot your password?
              </Link>
            </p>

            <p className="text-center text-sm text-muted-foreground">
              Need an account?{" "}
              <Link href="/register" className="underline underline-offset-4">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
