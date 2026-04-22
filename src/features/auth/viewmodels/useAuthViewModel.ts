'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/contexts/auth-context';

export function useAuthViewModel() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    if (!email.includes('@')) {
      setError('Insira um e-mail válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(email, password);
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao entrar.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    handleLogin,
  };
}
