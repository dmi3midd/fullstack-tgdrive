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
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-black text-brand-text uppercase tracking-tighter">Initialize</h1>
                <p className="mt-2 text-xs font-bold text-brand-accent uppercase tracking-[0.2em] opacity-60">Create your secure vault</p>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Identity Email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                />
                <Input
                    label="Secret Phrase"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                />

                <div className="pt-6 border-t border-brand-accent/10 mt-6 bg-brand-bg/30 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Bot size={18} className="text-brand-accent" />
                        <span className="text-[10px] font-black text-brand-accent/50 uppercase tracking-[0.3em]">Telegram Uplink</span>
                    </div>

                    <div className="space-y-5">
                        <Input
                            label="Bot Token"
                            required
                            value={botToken}
                            onChange={(e) => setBotToken(e.target.value)}
                            placeholder="123456789:ABCDE..."
                        />
                        <Input
                            label="Chat ID"
                            required
                            value={chatId}
                            onChange={(e) => setChatId(e.target.value)}
                            placeholder="123456789"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full mt-4 py-4 text-xs font-black uppercase tracking-[0.3em]"
                    isLoading={isLoading}
                >
                    Establish Vault
                </Button>
            </form>

            <div className="text-center">
                <p className="text-xs font-bold text-brand-text/40 uppercase tracking-widest">
                    Existing identity?{' '}
                    <Link to="/login" className="text-brand-accent hover:text-brand-text transition-all underline underline-offset-4 decoration-brand-accent/30 hover:decoration-brand-text">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};
