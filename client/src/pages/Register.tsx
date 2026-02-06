import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { AxiosError } from 'axios';
import { Bot } from 'lucide-react';

export const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [botToken, setBotToken] = useState('');
    const [chatId, setChatId] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await register({ email, password, botToken, chatId });
            navigate('/');
        } catch (err) {
            const e = err as AxiosError<{ message: string }>;
            setError(e.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                <p className="mt-2 text-sm text-gray-500">Provide your Telegram Bot credentials</p>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="At least 8 characters"
                />

                <div className="pt-2 border-t border-gray-100 mt-2">
                    <div className="flex items-center gap-2 mb-3">
                        <Bot size={16} className="text-blue-600" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Telegram Config</span>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Bot Token"
                            required
                            value={botToken}
                            onChange={(e) => setBotToken(e.target.value)}
                            placeholder="123456789:ABCDE..."
                            helperText="Get this from @BotFather"
                        />
                        <Input
                            label="Chat ID"
                            required
                            value={chatId}
                            onChange={(e) => setChatId(e.target.value)}
                            placeholder="123456789"
                            helperText="Your Telegram ID (use @userinfobot)"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full mt-4"
                    isLoading={isLoading}
                >
                    Create Account
                </Button>
            </form>

            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};
