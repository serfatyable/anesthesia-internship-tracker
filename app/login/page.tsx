'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get('callbackUrl') || '/dashboard';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormValues) => {
    setError(null);
    const res = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl,
    });
    if (!res) return setError('Unexpected error.');
    if (res.error) return setError('Invalid email or password.');
    router.push(res.url || callbackUrl);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input {...register('email')} className="mt-1 w-full border rounded px-3 py-2" />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              {...register('password')}
              className="mt-1 w-full border rounded px-3 py-2"
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={isSubmitting} className="w-full rounded-2xl py-2 border">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-xs text-gray-500">
          Timezone: Asia/Jerusalem • Sessions persist server-side
        </p>
      </div>
    </main>
  );
}
