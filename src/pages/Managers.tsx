import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Trash2, UserCog, Link } from "lucide-react";

interface Manager {
  id: string;
  name: string;
  email: string;
}

interface Profile {
  user_id: string;
  display_name: string;
}

interface CollaboratorManager {
  id: string;
  collaborator_user_id: string;
  manager_id: string;
}

const Managers = () => {
  const { user, isAdmin } = useAuth();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [links, setLinks] = useState<CollaboratorManager[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedCollaborator, setSelectedCollaborator] = useState("");

  const fetchData = async () => {
    const [mgrs, profs, lnks] = await Promise.all([
      supabase.from("managers").select("id, name, email").order("name"),
      supabase.from("profiles").select("user_id, display_name"),
      supabase.from("collaborator_manager").select("*"),
    ]);
    setManagers(mgrs.data ?? []);
    setProfiles(profs.data ?? []);
    setLinks(lnks.data ?? []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("managers").insert({ name, email, user_id: user.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Gestor adicionado!");
    setName(""); setEmail(""); setShowForm(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("managers").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Gestor removido!");
    fetchData();
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const existing = links.find(l => l.collaborator_user_id === selectedCollaborator);
    if (existing) {
      const { error } = await supabase.from("collaborator_manager").update({ manager_id: selectedManager }).eq("id", existing.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from("collaborator_manager").insert({ collaborator_user_id: selectedCollaborator, manager_id: selectedManager });
      if (error) { toast.error(error.message); return; }
    }
    toast.success("Vínculo atualizado!");
    setShowLinkForm(false);
    fetchData();
  };

  const getManagerName = (managerId: string) => managers.find(m => m.id === managerId)?.name ?? "—";
  const getCollaboratorName = (userId: string) => profiles.find(p => p.user_id === userId)?.display_name ?? userId;

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Gestores</h1>
          <p className="text-muted-foreground mt-1">Gerencie gestores e vínculos com colaboradores</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setShowLinkForm(!showLinkForm)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              <Link size={16} /> Vincular
            </button>
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              <Plus size={16} /> Novo Gestor
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card rounded-lg border p-6 mb-6 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Nome</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <button type="submit" className="px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity">Salvar</button>
        </form>
      )}

      {showLinkForm && (
        <form onSubmit={handleLink} className="bg-card rounded-lg border p-6 mb-6 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Colaborador</label>
              <select value={selectedCollaborator} onChange={e => setSelectedCollaborator(e.target.value)} required className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Selecione...</option>
                {profiles.map(p => <option key={p.user_id} value={p.user_id}>{p.display_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Gestor</label>
              <select value={selectedManager} onChange={e => setSelectedManager(e.target.value)} required className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Selecione...</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity">Vincular</button>
        </form>
      )}

      <div className="bg-card rounded-lg border overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                {isAdmin && <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {managers.map(m => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium flex items-center gap-2"><UserCog size={16} className="text-muted-foreground" />{m.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{m.email}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(m.id)} className="text-destructive hover:opacity-70 transition-opacity"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))}
              {managers.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">Nenhum gestor cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {links.length > 0 && (
        <>
          <h2 className="font-display font-semibold text-lg mb-4">Vínculos</h2>
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Colaborador</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gestor</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(l => (
                    <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{getCollaboratorName(l.collaborator_user_id)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{getManagerName(l.manager_id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default Managers;
