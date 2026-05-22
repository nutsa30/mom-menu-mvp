'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                password,
            }),
        });

        let data = null;

        try {
            data = await res.json();
        } catch {
            data = null;
        }

        if (res.ok) {
            alert('Account created!');
            router.push('/login');
        } else {
            alert(data.error || 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#fff8f6] px-6">
            <div className="w-full max-w-md bg-white p-10 rounded-[32px] shadow-xl">

                <h1 className="text-2xl font-bold mb-6 text-center">
                    Create Account
                </h1>

                <form onSubmit={handleSignup} className="space-y-4">

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7f50]"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7f50]"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ff7f50]"
                    />

                    <button
                        disabled={loading}
                        className="w-full bg-[#ff7f50] text-white py-3 rounded-full font-semibold hover:scale-105 transition disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                            </svg>
                        )}
                        {loading ? '...' : 'Sign Up'}
                    </button>

                </form>

                <p className="text-sm text-gray-500 mt-6 text-center">
                    Already have an account?{" "}
                    <a href="/login" className="text-[#ff7f50] font-semibold">
                        Login
                    </a>
                </p>

            </div>
        </main>
    );
}