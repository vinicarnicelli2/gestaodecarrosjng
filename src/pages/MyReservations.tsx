import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, CalendarCheck, Car, Clock } from "lucide-react";

interface DbVehicle { id: string; plate: string; model: string; }
interface Reservation {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at: string;
}

const MyReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<DbVehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [vehicleId, setVehicleId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

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

      // Send email to manager (recipient is derived server-side from JWT for security)
      const vehicle = getVehicle(vehicleId);
      await supabase.functions.invoke("send-reservation-notification", {
        body: {
          vehiclePlate: vehicle?.plate ?? "",
          vehicleModel: vehicle?.model ?? "",
          startDate,
          endDate,
          reason,
        },
      });

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

  const pending = reservations.filter(r => r.status === "pendente");
  const resolved = reservations.filter(r => r.status !== "pendente");

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Minhas Reservas</h1>
          <p className="text-muted-foreground mt-1">Acompanhe o status das suas solicitações</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
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

      {/* Pending */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Clock size={18} className="text-warning" />
            Aguardando Aprovação
          </h2>
          <div className="space-y-3">
            {pending.map((r, i) => {
              const v = getVehicle(r.vehicle_id);
              return (
                <div key={r.id} className="bg-card rounded-lg border border-warning/30 p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Car size={16} className="text-muted-foreground" />
                    <p className="font-semibold text-sm">{v?.model ?? ""} • {v?.plate ?? ""}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-sm">{r.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(r.start_date).toLocaleString("pt-BR")} → {new Date(r.end_date).toLocaleString("pt-BR")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolved */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <CalendarCheck size={18} className="text-muted-foreground" />
          Histórico
        </h2>
        {resolved.length === 0 ? (
          <div className="bg-card rounded-lg border p-8 text-center text-muted-foreground">
            Nenhuma reserva no histórico
          </div>
        ) : (
          <div className="space-y-3">
            {resolved.map((r, i) => {
              const v = getVehicle(r.vehicle_id);
              return (
                <div key={r.id} className="bg-card rounded-lg border p-5 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-sm">{v?.model ?? ""} • {v?.plate ?? ""}</p>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-sm">{r.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(r.start_date).toLocaleDateString("pt-BR")} → {new Date(r.end_date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MyReservations;
