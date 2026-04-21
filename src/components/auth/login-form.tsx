"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { login } from "@/modules/core/actions/auth";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Por favor, insira um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          className={`w-full p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
          placeholder="seu@email.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700" htmlFor="password">
          Senha
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className={`w-full p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
          placeholder="••••••"
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Autenticando...
          </>
        ) : (
          "Entrar no Sistema"
        )}
      </button>
    </form>
  );
}
