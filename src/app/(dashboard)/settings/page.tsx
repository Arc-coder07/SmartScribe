'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Sparkles,
  Download,
  Key,
  Bell,
  Palette,
  Globe,
  Shield,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const settingsSections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'workspace', label: 'Workspace', icon: Building2 },
  { id: 'ai', label: 'AI Preferences', icon: Sparkles },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
  const [user, setUser] = useState<{ email?: string; name?: string; initials?: string } | null>(null);
  const [profile, setProfile] = useState<{ company_name?: string; industry?: string; company_description?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const name = user.user_metadata?.full_name || 'User';
          const email = user.email || '';
          const initials = name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2) || 'U';

          setUser({ email, name, initials });

          // Fetch onboarding profile for workspace details
          const { data: profileData } = await supabase
            .from('onboarding_profiles')
            .select('company_name, industry, company_description')
            .eq('user_id', user.id)
            .single();

          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto px-6 py-8 space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-brand" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, workspace, and AI preferences.
        </p>
      </div>

      {/* Profile Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-medium">Profile</h2>
        </div>
        <div className="p-6 rounded-xl bg-surface/50 border border-border/50 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center text-xl font-bold text-brand-light">
              {isLoading ? '...' : user?.initials || 'U'}
            </div>
            <div>
              <p className="font-medium">{isLoading ? 'Loading...' : user?.name || 'User'}</p>
              <p className="text-sm text-muted-foreground">{isLoading ? 'Loading...' : user?.email || ''}</p>
              <Button variant="outline" size="sm" className="h-7 text-xs mt-2">
                Change Avatar
              </Button>
            </div>
          </div>
          <Separator className="bg-border/30" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Full Name</Label>
              <Input id="name" defaultValue={user?.name || ''} key={`name-${user?.name}`} className="bg-surface border-border/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input id="email" defaultValue={user?.email || ''} key={`email-${user?.email}`} className="bg-surface border-border/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-medium">Workspace</h2>
        </div>
        <div className="p-6 rounded-xl bg-surface/50 border border-border/50 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Company Name</Label>
              <Input defaultValue={profile?.company_name || ''} key={`company-${profile?.company_name}`} className="bg-surface border-border/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Industry</Label>
              <Select defaultValue={profile?.industry?.toLowerCase() || "technology"} key={`ind-${profile?.industry}`}>
                <SelectTrigger className="bg-surface border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Business Description</Label>
            <Input defaultValue={profile?.company_description || ''} key={`desc-${profile?.company_description}`} className="bg-surface border-border/50" />
          </div>
        </div>
      </section>

      {/* AI Preferences */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-medium">AI Preferences</h2>
        </div>
        <div className="p-6 rounded-xl bg-surface/50 border border-border/50 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">AI Model</Label>
              <Select defaultValue="gpt-4">
                <SelectTrigger className="bg-surface border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4o</SelectItem>
                  <SelectItem value="gemini">Gemini 2.5 Pro</SelectItem>
                  <SelectItem value="claude">Claude Sonnet 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Writing Tone</Label>
              <Select defaultValue="professional">
                <SelectTrigger className="bg-surface border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Creativity Level</Label>
            <div className="flex items-center gap-4">
              <input type="range" min="0" max="100" defaultValue="50" className="flex-1 accent-brand" />
              <span className="text-sm text-muted-foreground w-10 text-right">50%</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Lower = more consistent, Higher = more creative
            </p>
          </div>
        </div>
      </section>

      {/* API Keys */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-medium">API Keys</h2>
        </div>
        <div className="p-6 rounded-xl bg-surface/50 border border-border/50 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">OpenAI API Key</Label>
            <Input type="password" defaultValue="sk-xxxxxxxxxxxxxxxx" className="bg-surface border-border/50 font-mono text-xs" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Google AI API Key</Label>
            <Input placeholder="Enter your Gemini API key" className="bg-surface border-border/50 font-mono text-xs" />
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3" />
            API keys are encrypted and stored securely. They never leave your workspace.
          </p>
        </div>
      </section>

      {/* Billing */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-medium">Billing</h2>
        </div>
        <div className="p-6 rounded-xl bg-surface/50 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">Pro Plan</p>
                <Badge className="bg-brand/15 text-brand-light border-brand/20 text-[10px]">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">$29/month • Renews Jul 15, 2026</p>
            </div>
            <Button variant="outline" size="sm" className="h-8">Manage Billing</Button>
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline">Cancel</Button>
        <Button className="bg-brand hover:bg-brand-light text-foreground">Save Changes</Button>
      </div>
    </motion.div>
  );
}
