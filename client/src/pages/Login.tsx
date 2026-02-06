import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { AxiosError } from 'axios';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            const e = err as AxiosError<{ message: string }>;
            setError(e.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-black text-brand-text uppercase tracking-tighter">Sign In</h1>
                <p className="mt-2 text-xs font-bold text-brand-accent uppercase tracking-[0.2em] opacity-60">Access your vault</p>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                />
                <Input
                    label="Password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                />

                <Button
                    type="submit"
                    className="w-full py-4 text-xs font-black uppercase tracking-[0.3em]"
                    isLoading={isLoading}
                >
                    Authorize
                </Button>
            </form>

            <div className="text-center">
                <p className="text-xs font-bold text-brand-text/40 uppercase tracking-widest">
                    New user?{' '}
                    <Link to="/register" className="text-brand-accent hover:text-brand-text transition-all underline underline-offset-4 decoration-brand-accent/30 hover:decoration-brand-text">
                        Create identity
                    </Link>
                </p>
            </div>
        </div>
    );
};
