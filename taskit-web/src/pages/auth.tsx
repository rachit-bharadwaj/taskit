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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 relative overflow-hidden font-sans">
      {/* Left side: Image and Branding (only on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white/5">
        <div
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ backgroundImage: 'url("/auth-bg.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between h-full p-16">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="text-white h-8 w-8" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">Taskit</span>
          </div>
        </div>
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Background for mobile */}
        <div
          className="lg:hidden absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: 'url("/auth-bg.png")' }}
        />

        {/* Animated blobs for atmosphere */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse lg:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-10 text-center">
              <div className="flex justify-center mb-8 lg:hidden">
                <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <ShieldCheck className="text-white h-8 w-8" />
                </div>
              </div>

              <h2 className="text-4xl font-bold text-white mb-3">
                Welcome Back
              </h2>
              <p className="text-slate-400 mb-12 text-base">
                Securely sign in to your Taskit account
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={!!isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded-2xl py-4 text-slate-900 font-bold transition-all shadow-xl shadow-white/5 group"
                >
                  {isLoading === 'google' ? (
                    <div className="h-5 w-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                  ) : (
                    <FcGoogle className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  )}
                  <span>{isLoading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
                </button>

                <button
                  onClick={() => handleSocialLogin('github')}
                  disabled={!!isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded-2xl py-4 text-white font-bold transition-all shadow-xl shadow-black/20 group"
                >
                  {isLoading === 'github' ? (
                    <div className="h-5 w-5 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FaGithub className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  )}
                  <span>{isLoading === 'github' ? 'Connecting...' : 'Continue with GitHub'}</span>
                </button>
              </div>
            </div>

            <div className="bg-white/5 border-t border-white/10 p-8">
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                By signing in, you agree to our <button className="text-indigo-400 hover:underline">Terms of Service</button> <br /> and <button className="text-indigo-400 hover:underline">Privacy Policy</button>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
