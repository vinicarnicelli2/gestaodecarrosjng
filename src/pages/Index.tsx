import AppLayout from "@/components/AppLayout";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { mockVehicles, mockDrivers, mockMaintenances, mockReservations } from "@/lib/data";
import { Car, Users, Wrench, CalendarCheck, AlertTriangle, Droplets } from "lucide-react";

const Dashboard = () => {
  const availableVehicles = mockVehicles.filter((v) => v.status === "disponível").length;
  const activeDrivers = mockDrivers.filter((d) => d.status === "ativo").length;
  const pendingReservations = mockReservations.filter((r) => r.status === "pendente").length;
  const pendingMaintenance = mockMaintenances.filter((m) => m.status !== "concluída").length;
  const expiredCNH = mockDrivers.filter((d) => d.status === "cnh vencida").length;
  const oilAlerts = mockVehicles.filter((v) => v.nextOilChange - v.km < 3000).length;

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da frota</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <StatCard title="Veículos Disponíveis" value={availableVehicles} icon={<Car size={22} />} subtitle={`${mockVehicles.length} total`} variant="success" />
        <StatCard title="Motoristas Ativos" value={activeDrivers} icon={<Users size={22} />} subtitle={`${mockDrivers.length} cadastrados`} />
        <StatCard title="Reservas Pendentes" value={pendingReservations} icon={<CalendarCheck size={22} />} subtitle="Aguardando aprovação" variant="warning" />
        <StatCard title="Manutenções Ativas" value={pendingMaintenance} icon={<Wrench size={22} />} variant="accent" />
        <StatCard title="CNH Vencidas" value={expiredCNH} icon={<AlertTriangle size={22} />} subtitle="Atenção necessária" variant="destructive" />
        <StatCard title="Alertas de Óleo" value={oilAlerts} icon={<Droplets size={22} />} subtitle="Troca próxima" variant="warning" />
      </div>

      {/* Recent reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border p-6 animate-fade-in">
          <h2 className="font-display font-semibold text-lg mb-4">Reservas Recentes</h2>
          <div className="space-y-3">
            {mockReservations.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{r.driverName}</p>
                  <p className="text-xs text-muted-foreground">{r.vehicleModel} • {r.vehiclePlate}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-6 animate-fade-in">
          <h2 className="font-display font-semibold text-lg mb-4">Manutenções Próximas</h2>
          <div className="space-y-3">
            {mockMaintenances.filter(m => m.status !== "concluída").map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{m.type}</p>
                  <p className="text-xs text-muted-foreground">{m.vehiclePlate} • {m.date}</p>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
