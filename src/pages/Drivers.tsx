import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { mockDrivers } from "@/lib/data";
import { Users, AlertTriangle } from "lucide-react";

const Drivers = () => {
  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Motoristas</h1>
          <p className="text-muted-foreground mt-1">Controle de CNH e motoristas cadastrados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockDrivers.map((d, i) => {
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
                <StatusBadge status={d.status} />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">CNH</p>
                  <p className="text-sm font-mono font-medium">{d.cnh}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Categoria</p>
                  <p className="text-sm font-semibold">{d.cnhCategory}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Validade</p>
                  <div className="flex items-center gap-1">
                    {isExpired && <AlertTriangle size={12} className="text-destructive" />}
                    <p className={`text-sm font-medium ${isExpired ? "text-destructive" : ""}`}>
                      {new Date(d.cnhExpiry).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Drivers;
