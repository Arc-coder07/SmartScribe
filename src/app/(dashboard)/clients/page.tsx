'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Building2,
  FileText,
  Loader2,
  X,
  Save,
  UserPlus,
  StickyNote,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useClientStore, type Client } from '@/lib/stores/client-store';

// ─── Client Form Dialog ────────────────────────────────────────────────────

function ClientFormDialog({
  isOpen,
  onClose,
  client,
}: {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
}) {
  const { addClient, updateClient } = useClientStore();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        company: client.company || '',
        email: client.email || '',
        phone: client.phone || '',
        notes: client.notes || '',
      });
    } else {
      setFormData({ name: '', company: '', email: '', phone: '', notes: '' });
    }
  }, [client, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (client) {
        await updateClient(client.id, formData);
      } else {
        await addClient(formData);
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-4 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="w-full max-w-lg rounded-2xl bg-background border border-border/50 shadow-2xl shadow-black/20 overflow-hidden pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-brand" />
                  {client ? 'Edit Client' : 'Add Client'}
                </h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-active text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Name *</Label>
                    <Input
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-surface border-border/50 h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Company</Label>
                    <Input
                      placeholder="Acme Inc."
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="bg-surface border-border/50 h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      placeholder="john@acme.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-surface border-border/50 h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone</Label>
                    <Input
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-surface border-border/50 h-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Notes</Label>
                  <Textarea
                    placeholder="Any relevant notes about this client..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-surface border-border/50 min-h-[80px] resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-border/30">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button
                  onClick={handleSave}
                  disabled={!formData.name.trim() || isSaving}
                  className="bg-brand hover:bg-brand-light text-foreground gap-1.5"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {client ? 'Save Changes' : 'Add Client'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Clients Page ───────────────────────────────────────────────────────────

export default function ClientsPage() {
  const { clients, fetchClients, deleteClient, isLoading } = useClientStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = clients.filter((client) => {
    const q = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(q) ||
      (client.company || '').toLowerCase().includes(q) ||
      (client.email || '').toLowerCase().includes(q)
    );
  });

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingClient(undefined);
    setDialogOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto px-6 py-8 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-brand" />
            Clients
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your clients — AI uses this data to personalize documents.
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-brand hover:bg-brand-light text-foreground gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-surface border-border/50 h-9"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="px-4 py-3 rounded-xl bg-surface/50 border border-border/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-brand" />
          </div>
          <div>
            <p className="text-lg font-semibold">{clients.length}</p>
            <p className="text-[11px] text-muted-foreground">Total Clients</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 text-brand animate-spin" />
        </div>
      )}

      {/* Clients Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group p-4 rounded-xl bg-surface/50 border border-border/50 hover:border-brand/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/20 to-brand-light/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-brand">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-1.5 rounded-md hover:bg-surface-active text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteClient(client.id)}
                    className="p-1.5 rounded-md hover:bg-surface-active text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-medium mb-0.5">{client.name}</h3>
              {client.company && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Building2 className="h-3 w-3" />
                  {client.company}
                </div>
              )}

              <div className="space-y-1 mb-3">
                {client.email && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {client.phone}
                  </div>
                )}
              </div>

              {client.notes && (
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground border-t border-border/30 pt-2">
                  <StickyNote className="h-3 w-3 mt-0.5 shrink-0" />
                  <p className="line-clamp-2">{client.notes}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredClients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface flex items-center justify-center mb-4">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-2">No clients yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-4">
            Add your clients so SmartScribe can personalize proposals and documents with their details.
          </p>
          <Button
            onClick={handleAdd}
            className="bg-brand hover:bg-brand-light text-foreground gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Your First Client
          </Button>
        </div>
      )}

      {/* Client Form Dialog */}
      <ClientFormDialog
        isOpen={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingClient(undefined); }}
        client={editingClient}
      />
    </motion.div>
  );
}
