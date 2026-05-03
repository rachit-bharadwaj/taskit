import { motion } from 'framer-motion';
import {
  ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from 'revine';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleSocialLogin = (provider: 'google' | 'github') => {
    setIsLoading(provider);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(null);
      router.push('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
      {/* Background with the generated image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
        style={{ backgroundImage: 'url("/auth-bg.png")' }}
      />

      {/* Animated blobs for extra "wow" */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="flex justify-center mb-8">
              <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <ShieldCheck className="text-white h-8 w-8" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome to Taskit
            </h2>
            <p className="text-slate-400 mb-10 text-sm">
              Manage your team tasks effectively with secure authentication
            </p>

            <div className="space-y-4">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={!!isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded-xl py-3.5 text-slate-900 font-semibold transition-all shadow-xl shadow-white/5"
              >
                {isLoading === 'google' ? (
                  <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <FcGoogle className="h-5 w-5" />
                )}
                <span>{isLoading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              <button
                onClick={() => handleSocialLogin('github')}
                disabled={!!isLoading}
                className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded-xl py-3.5 text-white font-semibold transition-all shadow-xl shadow-black/20"
              >
                {isLoading === 'github' ? (
                  <div className="h-5 w-5 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                ) : (
                  <FaGithub className="h-5 w-5" />
                )}
                <span>{isLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white/5 border-t border-white/10 p-6">
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              By continuing, you agree to Taskit's <button className="text-indigo-400 hover:underline">Terms of Service</button> and <button className="text-indigo-400 hover:underline">Privacy Policy</button>.
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
