// src/components/AuthForm.jsx
// ─────────────────────────────────────────────────────────────
// Email / password signup & login form.
// Matches the existing dark "THE MAFIA" UI style.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthForm() {
  const [isLogin, setIsLogin]   = useState(true);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#050505]">
      {/* Title */}
      <h1 className="text-4xl font-black tracking-[0.25em] mb-2 shine-text uppercase">
        The Mafia
      </h1>
      <p className="text-zinc-500 text-sm mb-10 tracking-widest uppercase">
        {isLogin ? 'Sign in to play' : 'Create your account'}
      </p>

      {/* Card */}
      <div className="w-full max-w-sm bg-[#0d0d0d] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400 uppercase tracking-widest">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-[#1a1a1a] text-white rounded-lg px-4 py-3 text-sm outline-none border border-white/10 focus:border-white/30 transition placeholder-zinc-600"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[#1a1a1a] text-white rounded-lg px-4 py-3 text-sm outline-none border border-white/10 focus:border-white/30 transition placeholder-zinc-600"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="stealth-btn mt-1"
          >
            <div className="stealth-container-stars">
              <div className="stealth-stars" />
            </div>
            <span className="stealth-strong">
              {loading ? '...' : isLogin ? 'Sign In' : 'Sign Up'}
            </span>
            <div className="stealth-glow">
              <div className="stealth-circle" />
              <div className="stealth-circle" />
            </div>
          </button>
        </form>

        {/* Toggle signup / login */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-zinc-300 underline underline-offset-2 hover:text-white transition"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Convert Firebase error codes to readable messages ───────
function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try signing in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
