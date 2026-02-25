import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { mockReservations, Reservation } from "@/lib/data";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);

  const handleApproval = (id: string, action: "aprovada" | "rejeitada") => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r))
    );
    toast.success(action === "aprovada" ? "Reserva aprovada!" : "Reserva rejeitada.");
  };

  const pending = reservations.filter((r) => r.status === "pendente");
  const others = reservations.filter((r) => r.status !== "pendente");

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Reservas</h1>
        <p className="text-muted-foreground mt-1">Aprovação e controle de reservas de veículos</p>
      </div>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning" />
            Pendentes de Aprovação
          </h2>
          <div className="space-y-3">
            {pending.map((r, i) => (
              <div
                key={r.id}
                className="bg-card rounded-lg border border-warning/30 p-5 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">{r.driverName}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{r.vehicleModel} • {r.vehiclePlate}</p>
                    <p className="text-sm mt-1">{r.purpose}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(r.startDate).toLocaleDateString("pt-BR")} → {new Date(r.endDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproval(r.id, "aprovada")}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-success-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                      <CheckCircle size={16} /> Aprovar
                    </button>
                    <button
                      onClick={() => handleApproval(r.id, "rejeitada")}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                      <XCircle size={16} /> Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Motorista</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Veículo</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Período</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Finalidade</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {others.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{r.driverName}</td>
                    <td className="px-6 py-4 text-sm">{r.vehicleModel} <span className="text-muted-foreground font-mono">({r.vehiclePlate})</span></td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(r.startDate).toLocaleDateString("pt-BR")} → {new Date(r.endDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-sm">{r.purpose}</td>
                    <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reservations;
