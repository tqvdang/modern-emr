'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '../../components/auth/LoginForm';
import { adminApiClient } from '../../lib/api';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await adminApiClient.login(email, password);
      if (result.success) {
        router.push('/dashboard');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onLogin={handleLogin} loading={loading} />;
}