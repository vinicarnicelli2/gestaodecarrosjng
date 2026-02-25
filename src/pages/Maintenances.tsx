import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { mockMaintenances } from "@/lib/data";

const Maintenances = () => {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Manutenções</h1>
        <p className="text-muted-foreground mt-1">Histórico e agendamento de manutenções</p>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Veículo</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Descrição</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custo</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockMaintenances.map((m, i) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors" style={{ animationDelay: `${i * 50}ms` }}>
                  <td className="px-6 py-4 font-mono font-semibold text-sm">{m.vehiclePlate}</td>
                  <td className="px-6 py-4 text-sm font-medium">{m.type}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{m.description}</td>
                  <td className="px-6 py-4 text-sm">{new Date(m.date).toLocaleDateString("pt-BR")}</td>
                  <td className="px-6 py-4 text-sm font-medium">R$ {m.cost.toLocaleString("pt-BR")}</td>
                  <td className="px-6 py-4"><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Maintenances;
