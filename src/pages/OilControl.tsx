import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Droplets, AlertTriangle, CheckCircle, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const OilControl = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editVehicle, setEditVehicle] = useState<any>(null);
  const [formData, setFormData] = useState({ km: 0, next_oil_change: 0, last_oil_change: "" });

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles-oil"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*").order("plate");
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: { id: string; km: number; next_oil_change: number; last_oil_change: string }) => {
      const { error } = await supabase
        .from("vehicles")
        .update({ km: values.km, next_oil_change: values.next_oil_change, last_oil_change: values.last_oil_change })
        .eq("id", values.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles-oil"] });
      toast({ title: "Atualizado com sucesso" });
      setEditVehicle(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    },
  });

  const openEdit = (v: any) => {
    setEditVehicle(v);
    setFormData({
      km: v.km,
      next_oil_change: v.next_oil_change || 0,
      last_oil_change: v.last_oil_change || "",
    });
  };

  const handleSave = () => {
    if (!editVehicle) return;
    updateMutation.mutate({ id: editVehicle.id, ...formData });
  };

  const sorted = [...vehicles].sort((a, b) => ((a.next_oil_change || 0) - a.km) - ((b.next_oil_change || 0) - b.km));

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Controle de Óleo</h1>
        <p className="text-muted-foreground mt-1">Monitoramento de troca de óleo dos veículos</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((v, i) => {
            const nextOil = v.next_oil_change || 0;
            const remaining = nextOil - v.km;
            const percentage = Math.max(0, Math.min(100, ((v.km - (nextOil - 5000)) / 5000) * 100));
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(v)}
                      className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <div className={`p-2 rounded-lg ${isUrgent ? "bg-destructive/15 text-destructive" : isWarning ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
                      {isUrgent ? <AlertTriangle size={18} /> : isWarning ? <Droplets size={18} /> : <CheckCircle size={18} />}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">KM Atual</span>
                    <span className="font-medium">{v.km.toLocaleString("pt-BR")} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Próx. Troca</span>
                    <span className="font-medium">{nextOil.toLocaleString("pt-BR")} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Restante</span>
                    <span className={`font-bold ${isUrgent ? "text-destructive" : isWarning ? "text-warning" : "text-success"}`}>
                      {remaining.toLocaleString("pt-BR")} km
                    </span>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all ${isUrgent ? "bg-destructive" : isWarning ? "bg-warning" : "bg-success"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Última troca: {v.last_oil_change ? new Date(v.last_oil_change).toLocaleDateString("pt-BR") : "N/A"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!editVehicle} onOpenChange={(open) => !open && setEditVehicle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Óleo — {editVehicle?.plate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>KM Atual</Label>
              <Input
                type="number"
                value={formData.km}
                onChange={(e) => setFormData((p) => ({ ...p, km: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label>Próxima Troca (KM)</Label>
              <Input
                type="number"
                value={formData.next_oil_change}
                onChange={(e) => setFormData((p) => ({ ...p, next_oil_change: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label>Última Troca</Label>
              <Input
                type="date"
                value={formData.last_oil_change}
                onChange={(e) => setFormData((p) => ({ ...p, last_oil_change: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditVehicle(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default OilControl;
