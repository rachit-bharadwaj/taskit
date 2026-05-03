import api from '@/lib/api';
import { useEffect, useRef } from 'react';
import { useRouter } from 'revine';

export default function AuthCallback() {
  const router = useRouter();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          const response = await api.post('/auth/github', { code });

          if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            router.push('/');
          }
        } catch (error) {
          console.error('GitHub Callback Error:', error);
          alert('GitHub authentication failed');
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-medium animate-pulse">Completing authentication...</p>
      </div>
    </div>
  );
}
