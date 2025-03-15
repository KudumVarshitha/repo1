import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Crown, Lock } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function AdminLoginPage() {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success('Account created! Please check your email to confirm your account.');
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      toast.error(error.message || (isSignUp ? 'Failed to create account' : 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-luxury-black pt-16 sm:pt-20">
      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-luxury-gold/20 bg-black/50 p-8 backdrop-blur-lg">
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-luxury-gold/5 to-transparent" />
        
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-luxury-gold/20"
          >
            {isSignUp ? (
              <Crown className="h-8 w-8 text-luxury-gold" />
            ) : (
              <Lock className="h-8 w-8 text-luxury-gold" />
            )}
          </motion.div>
          
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-serif text-3xl font-bold tracking-tight text-white"
          >
            {isSignUp ? 'Create Admin Account' : 'Admin Access'}
          </motion.h2>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-sm text-gray-400"
          >
            {isSignUp
              ? 'Sign up to manage premium coupons'
              : 'Sign in to access the admin dashboard'}
          </motion.p>
        </div>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full rounded-lg border border-luxury-gold/20 bg-black/50 px-3 py-2 text-white placeholder-gray-500 backdrop-blur-sm transition-colors focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-1 block w-full rounded-lg border border-luxury-gold/20 bg-black/50 px-3 py-2 text-white placeholder-gray-500 backdrop-blur-sm transition-colors focus:border-luxury-gold focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                isSignUp ? 'Create Account' : 'Sign in'
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-gray-400 transition-colors hover:text-luxury-gold"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}