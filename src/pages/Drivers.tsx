import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Plus, Trash2, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Driver {
  id: string;
  name: string;
  cnh: string;
  cnh_expiry: string;
  cnh_category: string;
  phone: string;
  status: string;
}

const Drivers = () => {
  const { user, isAdmin } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", cnh: "", cnh_expiry: "", cnh_category: "B", phone: "", status: "ativo" });

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from("drivers")
      .select("id, name, cnh, cnh_expiry, cnh_category, phone, status")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar motoristas.");
      console.error(error);
    } else {
      setDrivers(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("drivers").insert({
      name: form.name,
      cnh: form.cnh,
      cnh_expiry: form.cnh_expiry,
      cnh_category: form.cnh_category,
      phone: form.phone,
      status: form.status,
      user_id: user.id,
    });
    if (error) {
      toast.error("Erro ao adicionar motorista: " + error.message);
      return;
    }
    toast.success("Motorista adicionado!");
    setForm({ name: "", cnh: "", cnh_expiry: "", cnh_category: "B", phone: "", status: "ativo" });
    setShowForm(false);
    fetchDrivers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este motorista?")) return;
    const { error } = await supabase.from("drivers").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
      return;
    }
    toast.success("Motorista excluído.");
    fetchDrivers();
  };

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Motoristas</h1>
          <p className="text-muted-foreground mt-1">Controle de CNH e motoristas cadastrados</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancelar" : "Adicionar"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card rounded-lg border p-6 mb-6 animate-fade-in">
          <h2 className="font-display font-semibold text-lg mb-4">Novo Motorista</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" required className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input value={form.cnh} onChange={(e) => setForm({ ...form, cnh: e.target.value })} placeholder="Nº CNH" required className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="date" value={form.cnh_expiry} onChange={(e) => setForm({ ...form, cnh_expiry: e.target.value })} required className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <select value={form.cnh_category} onChange={(e) => setForm({ ...form, cnh_category: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Telefone" required className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="cnh vencida">CNH Vencida</option>
            </select>
          </div>
          <button type="submit" className="mt-4 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            Salvar
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Carregando...</p>
      ) : drivers.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhum motorista cadastrado</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drivers.map((d, i) => {
            const isExpired = d.status === "cnh vencida";
            return (
              <div
                key={d.id}
                className={`bg-card rounded-lg border p-5 animate-fade-in ${isExpired ? "border-destructive/40" : ""}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={d.status} />
                    {isAdmin && (
                      <button onClick={() => handleDelete(d.id)} className="text-destructive hover:text-destructive/80 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">CNH</p>
                    <p className="text-sm font-mono font-medium">{d.cnh}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Categoria</p>
                    <p className="text-sm font-semibold">{d.cnh_category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Validade</p>
                    <div className="flex items-center gap-1">
                      {isExpired && <AlertTriangle size={12} className="text-destructive" />}
                      <p className={`text-sm font-medium ${isExpired ? "text-destructive" : ""}`}>
                        {new Date(d.cnh_expiry).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default Drivers;
