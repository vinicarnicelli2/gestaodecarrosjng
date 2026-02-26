import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Car, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  year: number;
  km: number;
  status: string;
}

const Vehicles = () => {
  const { user, isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ plate: "", model: "", year: "", km: "", status: "disponível" });

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("id, plate, model, year, km, status")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar veículos.");
      console.error(error);
    } else {
      setVehicles(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("vehicles").insert({
      plate: form.plate.toUpperCase(),
      model: form.model,
      year: Number(form.year),
      km: Number(form.km),
      status: form.status,
      user_id: user.id,
    });
    if (error) {
      toast.error("Erro ao adicionar veículo: " + error.message);
      return;
    }
    toast.success("Veículo adicionado!");
    setForm({ plate: "", model: "", year: "", km: "", status: "disponível" });
    setShowForm(false);
    fetchVehicles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return;
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
      return;
    }
    toast.success("Veículo excluído.");
    fetchVehicles();
  };

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Veículos</h1>
          <p className="text-muted-foreground mt-1">Gestão da frota de veículos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
            <Car size={18} />
            <span className="font-semibold text-sm">{vehicles.length} veículos</span>
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
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-card rounded-lg border p-6 mb-6 animate-fade-in">
          <h2 className="font-display font-semibold text-lg mb-4">Novo Veículo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} placeholder="Placa" required className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Modelo" required className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="Ano" required className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="number" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })} placeholder="KM" required className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="disponível">Disponível</option>
              <option value="em uso">Em uso</option>
              <option value="manutenção">Manutenção</option>
            </select>
          </div>
          <button type="submit" className="mt-4 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
            Salvar
          </button>
        </form>
      )}

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Placa</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Modelo</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ano</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">KM</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                {isAdmin && <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Carregando...</td></tr>
              ) : vehicles.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Nenhum veículo cadastrado</td></tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-sm">{v.plate}</td>
                    <td className="px-6 py-4 text-sm">{v.model}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{v.year}</td>
                    <td className="px-6 py-4 text-sm">{v.km.toLocaleString("pt-BR")} km</td>
                    <td className="px-6 py-4"><StatusBadge status={v.status} /></td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <button onClick={() => handleDelete(v.id)} className="text-destructive hover:text-destructive/80 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Vehicles;
