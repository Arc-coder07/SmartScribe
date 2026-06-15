'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

/* ─── Floating shape CSS animations (pure CSS, not Framer Motion) ──────── */
const floatingShapeStyles = `
  @keyframes float-1 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(30px, -40px) rotate(90deg); }
    50% { transform: translate(-20px, -80px) rotate(180deg); }
    75% { transform: translate(40px, -30px) rotate(270deg); }
  }
  @keyframes float-2 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(-40px, 30px) rotate(-90deg); }
    50% { transform: translate(30px, 60px) rotate(-180deg); }
    75% { transform: translate(-20px, -40px) rotate(-270deg); }
  }
  @keyframes float-3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(50px, -50px) scale(1.1); }
    66% { transform: translate(-30px, 30px) scale(0.9); }
  }
  @keyframes float-4 {
    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
    50% { transform: translate(-60px, -30px) rotate(180deg) scale(1.15); }
  }
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

const shapes = [
  { className: 'w-72 h-72 rounded-full', style: { top: '10%', left: '15%', animation: 'float-1 20s ease-in-out infinite', background: 'rgba(124, 58, 237, 0.08)' } },
  { className: 'w-48 h-48 rounded-2xl', style: { top: '55%', left: '60%', animation: 'float-2 25s ease-in-out infinite', background: 'rgba(59, 130, 246, 0.08)', transform: 'rotate(45deg)' } },
  { className: 'w-36 h-36 rounded-full', style: { top: '70%', left: '20%', animation: 'float-3 18s ease-in-out infinite', background: 'rgba(124, 58, 237, 0.06)' } },
  { className: 'w-56 h-56 rounded-3xl', style: { top: '20%', left: '55%', animation: 'float-4 22s ease-in-out infinite', background: 'rgba(59, 130, 246, 0.06)', transform: 'rotate(15deg)' } },
  { className: 'w-24 h-24 rounded-full', style: { top: '40%', left: '35%', animation: 'float-1 15s ease-in-out infinite reverse', background: 'rgba(124, 58, 237, 0.1)' } },
  { className: 'w-16 h-16 rounded-lg', style: { top: '15%', left: '75%', animation: 'float-2 17s ease-in-out infinite reverse', background: 'rgba(59, 130, 246, 0.1)', transform: 'rotate(30deg)' } },
];

/* ─── Animation variants ───────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const brandVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ─── Icons ────────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62Z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"/>
    </svg>
  );
}

/* ─── Component ────────────────────────────────────────────────────────── */
export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleCreateAccount = async () => {
    try {
      setError('');
      setLoading(true);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            company: company,
          }
        }
      });

      if (signUpError) throw signUpError;
      
      // If sign up is successful, Supabase usually returns a session immediately if email confirmation is disabled,
      // or logs them in if autoConfirm is true.
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: floatingShapeStyles }} />

      <div className="flex min-h-screen w-full bg-background">
        {/* ─── Left Panel: Branding ─────────────────────────────────────── */}
        <div className="relative hidden w-[60%] overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
          {/* Animated gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, var(--background) 0%, #1a0b2e 30%, #0f172a 60%, var(--background) 100%)',
              backgroundSize: '400% 400%',
              animation: 'gradient-shift 15s ease infinite',
            }}
          />

          {/* Gradient mesh overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(ellipse at 20% 50%, rgba(124, 58, 237, 0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(124, 58, 237, 0.08) 0%, transparent 60%)',
            }}
          />

          {/* Floating geometric shapes */}
          {shapes.map((shape, i) => (
            <div
              key={i}
              className={`absolute ${shape.className}`}
              style={shape.style}
            />
          ))}

          {/* Branding content */}
          <motion.div
            className="relative z-10"
            variants={brandVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand">
                <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">SmartScribe</span>
            </div>
          </motion.div>

          {/* Center tagline */}
          <motion.div
            className="relative z-10 max-w-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              <span className="text-foreground">Start creating</span>
              <br />
              <span className="gradient-brand-text">extraordinary content.</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Join thousands of writers, marketers, and teams who use SmartScribe to produce their best work.
            </p>
          </motion.div>

          {/* Bottom stats */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="glass-subtle rounded-2xl p-6 max-w-md">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-2xl font-bold text-foreground">50K+</p>
                  <p className="text-xs text-muted-foreground mt-1">Active writers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">2M+</p>
                  <p className="text-xs text-muted-foreground mt-1">Documents created</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">99.9%</p>
                  <p className="text-xs text-muted-foreground mt-1">Uptime</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Right Panel: Signup Form ─────────────────────────────────── */}
        <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[40%]">
          {/* Mobile logo */}
          <motion.div
            className="mb-8 flex items-center gap-3 lg:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand">
              <svg className="h-5 w-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">SmartScribe</span>
          </motion.div>

          <motion.div
            className="w-full max-w-sm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Start your free trial — no credit card required
              </p>
            </motion.div>

            {/* Form */}
            <div className="space-y-4">
              {/* Full Name */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="name" className="text-muted-foreground">
                  Full name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="h-11 pl-10 bg-muted/50 border-border text-foreground placeholder:text-zinc-600 focus-visible:border-[#10a37f]/50 focus-visible:ring-[#10a37f]/20"
                  />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-11 pl-10 bg-muted/50 border-border text-foreground placeholder:text-zinc-600 focus-visible:border-[#10a37f]/50 focus-visible:ring-[#10a37f]/20"
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="password" className="text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="h-11 pl-10 pr-10 bg-muted/50 border-border text-foreground placeholder:text-zinc-600 focus-visible:border-[#10a37f]/50 focus-visible:ring-[#10a37f]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Company Name */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="company" className="text-muted-foreground">
                  Company name
                  <span className="text-zinc-600 font-normal ml-1">(optional)</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                    className="h-11 pl-10 bg-muted/50 border-border text-foreground placeholder:text-zinc-600 focus-visible:border-[#10a37f]/50 focus-visible:ring-[#10a37f]/20"
                  />
                </div>
              </motion.div>

              {error && (
                <motion.div variants={itemVariants} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </motion.div>
              )}

              {/* Create account button */}
              <motion.div variants={itemVariants} className="pt-1">
                <Button
                  onClick={handleCreateAccount}
                  disabled={loading}
                  className="h-11 w-full gradient-brand border-0 text-foreground font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  size="lg"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </motion.div>

              {/* Terms */}
              <motion.p variants={itemVariants} className="text-xs text-zinc-600 text-center leading-relaxed">
                By creating an account, you agree to our{' '}
                <button className="text-muted-foreground hover:text-muted-foreground underline underline-offset-2 transition-colors">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button className="text-muted-foreground hover:text-muted-foreground underline underline-offset-2 transition-colors">
                  Privacy Policy
                </button>
              </motion.p>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative flex items-center gap-4 py-1">
                <div className="h-px flex-1 bg-white/[0.08]" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">or continue with</span>
                <div className="h-px flex-1 bg-white/[0.08]" />
              </motion.div>

              {/* OAuth buttons */}
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-11 border-border bg-muted/30 hover:bg-white/[0.06] text-muted-foreground gap-2 cursor-pointer"
                  size="lg"
                >
                  <GoogleIcon />
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-border bg-muted/30 hover:bg-white/[0.06] text-muted-foreground gap-2 cursor-pointer"
                  size="lg"
                >
                  <GitHubIcon />
                  GitHub
                </Button>
              </motion.div>

              {/* Sign in link */}
              <motion.p variants={itemVariants} className="text-center text-sm text-muted-foreground pt-2">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-[#10a37f] hover:text-[#12b78e] font-medium transition-colors"
                >
                  Sign in
                </Link>
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
