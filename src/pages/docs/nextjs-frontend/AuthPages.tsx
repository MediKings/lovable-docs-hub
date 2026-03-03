import { DocsLayout } from "@/components/layout/DocsLayout";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/docs/Callout";
import { DocsPagination } from "@/components/docs/DocsPagination";

const tocItems = [
  { title: "AuthProvider (Context)", href: "#auth-provider", level: 2 },
  { title: "Hook useAuth", href: "#use-auth", level: 2 },
  { title: "Page de connexion", href: "#login", level: 2 },
  { title: "Page d'inscription", href: "#register", level: 2 },
  { title: "Middleware de protection", href: "#middleware", level: 2 },
];

const authProviderCode = `// src/providers/auth-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { getAccessToken, setTokens, clearTokens } from "@/lib/auth";
import type { User, AuthTokens } from "@/types/user";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ✅ TanStack Query pour récupérer le profil utilisateur
  const { data: user = null, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<User>("/auth/me/");
      return data;
    },
    enabled: !!getAccessToken(),
    retry: false,
  });

  // ✅ Mutation login via Axios
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const { data } = await apiClient.post<AuthTokens>("/auth/token/", {
        username,
        password,
      });
      return data;
    },
    onSuccess: (data) => {
      setTokens(data.access, data.refresh);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.push("/");
    },
  });

  // ✅ Mutation register via Axios
  const registerMutation = useMutation({
    mutationFn: async (registerData: RegisterData) => {
      await apiClient.post("/auth/register/", registerData);
      return registerData;
    },
    onSuccess: async (registerData) => {
      await loginMutation.mutateAsync({
        username: registerData.username,
        password: registerData.password,
      });
    },
  });

  const logout = () => {
    clearTokens();
    queryClient.clear();
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: (username, password) => loginMutation.mutateAsync({ username, password }),
        register: (data) => registerMutation.mutateAsync(data),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};`;

const loginPageCode = `// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      await login(data.username, data.password);
    } catch {
      setError("Identifiants incorrects. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input id="username" {...register("username")} />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Pas de compte ?{" "}
              <Link href="/register" className="text-primary underline">
                S'inscrire
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;`;

const registerPageCode = `// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Minimum 3 caractères")
      .regex(/^[a-zA-Z0-9_]+$/, "Lettres, chiffres et _ uniquement"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    password_confirm: z.string(),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["password_confirm"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError(null);
      await registerUser(data);
    } catch {
      setError("Erreur lors de l'inscription. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inscription</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input id="username" {...register("username")} />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirm">Confirmer</Label>
              <Input
                id="password_confirm"
                type="password"
                {...register("password_confirm")}
              />
              {errors.password_confirm && (
                <p className="text-sm text-destructive">
                  {errors.password_confirm.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Inscription..." : "S'inscrire"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-primary underline">
                Se connecter
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;`;

const middlewareCode = `// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/posts/create", "/profile"];
const AUTH_ROUTES = ["/login", "/register"];

export const middleware = (request: NextRequest) => {
  const token = request.cookies.get("gs_access_token")?.value;
  const { pathname } = request.nextUrl;

  // Rediriger vers login si route protégée sans token
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rediriger vers accueil si déjà connecté sur login/register
  if (AUTH_ROUTES.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/posts/create", "/profile/:path*", "/login", "/register"],
};`;

const AuthPages = () => {
  return (
    <DocsLayout tocItems={tocItems}>
      <h1>Next.js Frontend — Authentification</h1>

      <p>
        Implémentation complète de l'authentification JWT côté client avec 
        <strong> Axios</strong> pour les requêtes, <strong>TanStack Query v5</strong> pour le cache 
        du profil utilisateur, et <strong>Zod</strong> + <strong>React Hook Form</strong> pour la validation.
      </p>

      <Callout type="tip" title="Pattern GhennySoft">
        L'AuthProvider utilise TanStack Query pour récupérer et cacher le profil utilisateur. 
        Les mutations login/register passent par <code>useMutation</code> pour une gestion 
        d'état automatique.
      </Callout>

      <hr />

      <h2 id="auth-provider">AuthProvider (Context + TanStack Query)</h2>
      <CodeBlock code={authProviderCode} language="typescript" />

      <h2 id="use-auth">Hook useAuth</h2>
      <p>
        Le hook est exporté directement depuis le provider. Il expose <code>user</code>, 
        <code>isLoading</code>, <code>login()</code>, <code>register()</code> et <code>logout()</code>.
      </p>

      <h2 id="login">Page de connexion</h2>
      <CodeBlock code={loginPageCode} language="typescript" />

      <h2 id="register">Page d'inscription</h2>
      <CodeBlock code={registerPageCode} language="typescript" />

      <h2 id="middleware">Middleware de protection</h2>
      <p>
        Le middleware Next.js protège les routes sensibles côté serveur, avant même 
        le rendu de la page.
      </p>
      <CodeBlock code={middlewareCode} language="typescript" />

      <DocsPagination
        prev={{ title: "Setup & Configuration", href: "/docs/nextjs-frontend/setup" }}
        next={{ title: "Pages Articles", href: "/docs/nextjs-frontend/posts" }}
      />
    </DocsLayout>
  );
};

export default AuthPages;
