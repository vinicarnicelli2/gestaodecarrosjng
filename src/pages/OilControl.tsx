import AppLayout from "@/components/AppLayout";
import { mockVehicles } from "@/lib/data";
import { Droplets, AlertTriangle, CheckCircle } from "lucide-react";

const OilControl = () => {
  const sorted = [...mockVehicles].sort((a, b) => (a.nextOilChange - a.km) - (b.nextOilChange - b.km));

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Controle de Óleo</h1>
        <p className="text-muted-foreground mt-1">Monitoramento de troca de óleo dos veículos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map((v, i) => {
          const remaining = v.nextOilChange - v.km;
          const percentage = Math.max(0, Math.min(100, ((v.km - (v.nextOilChange - 5000)) / 5000) * 100));
          const isUrgent = remaining < 1000;
          const isWarning = remaining < 3000 && !isUrgent;

          return (
            <div
              key={v.id}
              className={`bg-card rounded-lg border p-5 animate-fade-in ${isUrgent ? "border-destructive/40" : isWarning ? "border-warning/40" : ""}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-mono font-bold text-sm">{v.plate}</p>
                  <p className="text-xs text-muted-foreground">{v.model}</p>
                </div>
                <div className={`p-2 rounded-lg ${isUrgent ? "bg-destructive/15 text-destructive" : isWarning ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
                  {isUrgent ? <AlertTriangle size={18} /> : isWarning ? <Droplets size={18} /> : <CheckCircle size={18} />}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">KM Atual</span>
                  <span className="font-medium">{v.km.toLocaleString("pt-BR")} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Próx. Troca</span>
                  <span className="font-medium">{v.nextOilChange.toLocaleString("pt-BR")} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Restante</span>
                  <span className={`font-bold ${isUrgent ? "text-destructive" : isWarning ? "text-warning" : "text-success"}`}>
                    {remaining.toLocaleString("pt-BR")} km
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all ${isUrgent ? "bg-destructive" : isWarning ? "bg-warning" : "bg-success"}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Última troca: {new Date(v.lastOilChange).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default OilControl;
