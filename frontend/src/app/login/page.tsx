'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useAuth } from "@/components/authCheck";


export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/api/v1/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: data.message || 'Login successful' });
        localStorage.setItem("isLoggedIn", "true");
        login();
        setTimeout(() => {
          router.push('/');
        }, 1000); // 1s delay to show success message
      } else {
        setAlert({ type: 'error', message: data.message || 'Invalid credentials' });
      }
    } catch (err) {
      console.error('Login error:', err);
      setAlert({ type: 'error', message: 'Server error. Please try again later.' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f] px-4">
      <div className="w-full max-w-sm">
        {alert && (
          <Alert variant={alert.type === 'error' ? 'destructive' : 'default'} className="mb-6">
            <Terminal className="h-4 w-4" />
            <AlertTitle>{alert.type === 'error' ? 'Error!' : 'Success!'}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="bg-black p-8 rounded shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-center text-white">Admin Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded mb-4 bg-black"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded mb-6 bg-black"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
