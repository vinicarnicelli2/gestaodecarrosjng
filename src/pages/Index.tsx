import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { Car, Users, Wrench, CalendarCheck, AlertTriangle, Droplets, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { useMemo } from "react";

const Dashboard = () => {
  const { role, loading } = useAuth();

  const { data: vehicles = [] } = useQuery({
    queryKey: ["dashboard-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ["dashboard-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("drivers").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: maintenances = [] } = useQuery({
    queryKey: ["dashboard-maintenances"],
    queryFn: async () => {
      const { data, error } = await supabase.from("maintenances").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ["dashboard-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reservations").select("*, vehicles(plate, model)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["dashboard-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, display_name");
      if (error) throw error;
      return data;
    },
  });

  const profileMap = useMemo(() => {
    const map: Record<string, string> = {};
    profiles.forEach((p) => { map[p.user_id] = p.display_name; });
    return map;
  }, [profiles]);

  // Monthly maintenance cost chart data
  const chartData = useMemo(() => {
    const monthly: Record<string, number> = {};
    maintenances.forEach((m) => {
      const month = m.date.slice(0, 7);
      monthly[month] = (monthly[month] || 0) + Number(m.cost);
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, total]) => ({
        month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short" }),
        total,
      }));
  }, [maintenances]);

  if (!loading && role !== "admin") {
    return <Navigate to="/checklist" replace />;
  }

  const availableVehicles = vehicles.filter((v) => v.status === "disponível").length;
  const activeDrivers = drivers.filter((d) => d.status === "ativo").length;
  const pendingReservations = reservations.filter((r) => r.status === "pendente").length;
  const pendingMaintenance = maintenances.filter((m) => m.status !== "concluída").length;
  const expiredCNH = drivers.filter((d) => d.status === "cnh vencida").length;
  const oilAlerts = vehicles.filter((v) => (v.next_oil_change || 0) - v.km < 3000).length;


  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da frota</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <StatCard title="Veículos Disponíveis" value={availableVehicles} icon={<Car size={22} />} subtitle={`${vehicles.length} total`} variant="success" />
        <StatCard title="Motoristas Ativos" value={activeDrivers} icon={<Users size={22} />} subtitle={`${drivers.length} cadastrados`} />
        <StatCard title="Reservas Pendentes" value={pendingReservations} icon={<CalendarCheck size={22} />} subtitle="Aguardando aprovação" variant="warning" />
        <StatCard title="Manutenções Ativas" value={pendingMaintenance} icon={<Wrench size={22} />} variant="accent" />
        <StatCard title="CNH Vencidas" value={expiredCNH} icon={<AlertTriangle size={22} />} subtitle="Atenção necessária" variant="destructive" />
        <StatCard title="Alertas de Óleo" value={oilAlerts} icon={<Droplets size={22} />} subtitle="Troca próxima" variant="warning" />
      </div>

      {/* Charts + Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Maintenance cost chart */}
        <div className="bg-card rounded-lg border p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-display font-semibold text-lg">Custos de Manutenção</h2>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `R$${v}`} />
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Custo"]} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm">Sem dados de manutenção</p>
          )}
        </div>

        {/* Oil alerts */}
        <div className="bg-card rounded-lg border p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Droplets size={18} className="text-warning" />
            <h2 className="font-display font-semibold text-lg">Alertas de Óleo</h2>
          </div>
          <div className="space-y-3">
            {vehicles
              .filter((v) => (v.next_oil_change || 0) - v.km < 3000)
              .sort((a, b) => ((a.next_oil_change || 0) - a.km) - ((b.next_oil_change || 0) - b.km))
              .slice(0, 5)
              .map((v) => {
                const remaining = (v.next_oil_change || 0) - v.km;
                const isUrgent = remaining < 1000;
                return (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-mono font-bold text-sm">{v.plate}</p>
                      <p className="text-xs text-muted-foreground">{v.model}</p>
                    </div>
                    <span className={`text-sm font-bold ${isUrgent ? "text-destructive" : "text-warning"}`}>
                      {remaining.toLocaleString("pt-BR")} km
                    </span>
                  </div>
                );
              })}
            {oilAlerts === 0 && <p className="text-muted-foreground text-sm">Nenhum alerta</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent reservations */}
        <div className="bg-card rounded-lg border p-6 animate-fade-in">
          <h2 className="font-display font-semibold text-lg mb-4">Reservas Recentes</h2>
          <div className="space-y-3">
            {reservations.slice(0, 5).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{profileMap[r.user_id] || "Usuário"}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.vehicles?.model || ""} • {r.vehicles?.plate || ""}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
            {reservations.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma reserva</p>}
          </div>
        </div>

        {/* Upcoming maintenances */}
        <div className="bg-card rounded-lg border p-6 animate-fade-in">
          <h2 className="font-display font-semibold text-lg mb-4">Manutenções Próximas</h2>
          <div className="space-y-3">
            {maintenances.filter((m) => m.status !== "concluída").slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{m.type}</p>
                  <p className="text-xs text-muted-foreground">{m.vehicle_plate} • {new Date(m.date).toLocaleDateString("pt-BR")}</p>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
            {maintenances.filter((m) => m.status !== "concluída").length === 0 && (
              <p className="text-muted-foreground text-sm">Nenhuma manutenção pendente</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
