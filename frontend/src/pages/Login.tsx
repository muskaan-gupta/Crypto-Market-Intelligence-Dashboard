import React, { useState } from 'react';
import { authApi } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { Button, Card, ErrorMessage } from '../components/shared';

interface AuthProps {
  onSwitchToRegister: () => void;
}

export const Login: React.FC<AuthProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('demo@kuvaka.io');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.login(email, password);
      const { token, user } = response.data;

      setToken(token);
      setUser(user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Crypto Dashboard
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <ErrorMessage error={error} />}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Sign Up
          </button>
        </p>
      </Card>
    </div>
  );
};
