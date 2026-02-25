import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { mockVehicles } from "@/lib/data";
import { Car } from "lucide-react";

const Vehicles = () => {
  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Veículos</h1>
          <p className="text-muted-foreground mt-1">Gestão da frota de veículos</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
          <Car size={18} />
          <span className="font-semibold text-sm">{mockVehicles.length} veículos</span>
        </div>
      </div>

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
              </tr>
            </thead>
            <tbody>
              {mockVehicles.map((v, i) => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors" style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="px-6 py-4 font-mono font-semibold text-sm">{v.plate}</td>
                  <td className="px-6 py-4 text-sm">{v.model}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{v.year}</td>
                  <td className="px-6 py-4 text-sm">{v.km.toLocaleString("pt-BR")} km</td>
                  <td className="px-6 py-4"><StatusBadge status={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Vehicles;
