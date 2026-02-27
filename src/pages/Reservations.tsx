import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CheckCircle, XCircle, Plus, CalendarCheck } from "lucide-react";

interface DbVehicle { id: string; plate: string; model: string; }
interface Reservation {
  id: string;
  user_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}

const Reservations = () => {
  const { user, isAdmin } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<DbVehicle[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    const [resRes, vehRes, profRes] = await Promise.all([
      supabase.from("reservations").select("*").order("created_at", { ascending: false }),
      supabase.from("vehicles").select("id, plate, model"),
      supabase.from("profiles").select("user_id, display_name"),
    ]);
    setReservations(resRes.data ?? []);
    setVehicles(vehRes.data ?? []);
    const pMap: Record<string, string> = {};
    (profRes.data ?? []).forEach((p: any) => { pMap[p.user_id] = p.display_name; });
    setProfiles(pMap);
  };

  useEffect(() => { fetchData(); }, []);

  const getVehicle = (id: string) => vehicles.find(v => v.id === id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from("reservations").insert({
        user_id: user.id,
        vehicle_id: vehicleId,
        start_date: startDate,
        end_date: endDate,
        reason,
      });
      if (error) throw error;

      // Send email to manager
      const { data: linkData } = await supabase
        .from("collaborator_manager")
        .select("manager_id")
        .eq("collaborator_user_id", user.id)
        .maybeSingle();

      if (linkData?.manager_id) {
        const { data: managerData } = await supabase
          .from("managers")
          .select("name, email")
          .eq("id", linkData.manager_id)
          .single();

        if (managerData) {
          const vehicle = getVehicle(vehicleId);
          await supabase.functions.invoke("send-reservation-notification", {
            body: {
              managerEmail: managerData.email,
              managerName: managerData.name,
              requesterName: profiles[user.id] ?? user.email,
              vehiclePlate: vehicle?.plate ?? "",
              vehicleModel: vehicle?.model ?? "",
              startDate,
              endDate,
              reason,
            },
          });
        }
      }

      toast.success("Reserva solicitada com sucesso!");
      setShowForm(false);
      setVehicleId(""); setStartDate(""); setEndDate(""); setReason("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao solicitar reserva");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproval = async (id: string, action: "aprovada" | "rejeitada") => {
    const { error } = await supabase.from("reservations").update({ status: action }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(action === "aprovada" ? "Reserva aprovada!" : "Reserva rejeitada.");
    fetchData();
  };

  const pending = reservations.filter(r => r.status === "pendente");
  const others = reservations.filter(r => r.status !== "pendente");

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Reservas</h1>
          <p className="text-muted-foreground mt-1">Solicite e gerencie reservas de veículos</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity">
          <Plus size={16} /> Nova Reserva
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-lg border p-6 mb-6 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Veículo</label>
              <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} required className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Selecione...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} — {v.model}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Motivo</label>
              <input type="text" value={reason} onChange={e => setReason(e.target.value)} required placeholder="Ex: Visita técnica" className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Data Início</label>
              <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Data Fim</label>
              <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40">
            {submitting ? "Enviando..." : "Solicitar Reserva"}
          </button>
        </form>
      )}

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning" />
            Pendentes de Aprovação
          </h2>
          <div className="space-y-3">
            {pending.map((r, i) => {
              const v = getVehicle(r.vehicle_id);
              return (
                <div key={r.id} className="bg-card rounded-lg border border-warning/30 p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold">{profiles[r.user_id] ?? "Colaborador"}</p>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{v?.model ?? ""} • {v?.plate ?? ""}</p>
                      <p className="text-sm mt-1">{r.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(r.start_date).toLocaleString("pt-BR")} → {new Date(r.end_date).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApproval(r.id, "aprovada")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-success-foreground font-medium text-sm hover:opacity-90 transition-opacity">
                          <CheckCircle size={16} /> Aprovar
                        </button>
                        <button onClick={() => handleApproval(r.id, "rejeitada")} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium text-sm hover:opacity-90 transition-opacity">
                          <XCircle size={16} /> Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Histórico</h2>
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Solicitante</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Veículo</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Período</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Motivo</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {others.map(r => {
                  const v = getVehicle(r.vehicle_id);
                  return (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{profiles[r.user_id] ?? "—"}</td>
                      <td className="px-6 py-4 text-sm">{v?.model ?? ""} <span className="text-muted-foreground font-mono">({v?.plate ?? ""})</span></td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(r.start_date).toLocaleDateString("pt-BR")} → {new Date(r.end_date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 text-sm">{r.reason}</td>
                      <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                    </tr>
                  );
                })}
                {others.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Nenhuma reserva no histórico</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reservations;
