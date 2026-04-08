import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Droplets, AlertTriangle, CheckCircle, Pencil, Bell, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const OilControl = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [editVehicle, setEditVehicle] = useState<any>(null);
  const [formData, setFormData] = useState({ km: 0, next_oil_change: 0, last_oil_change: "" });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({ plate: "", model: "", year: "", km: "0", next_oil_change: "0", last_oil_change: "" });
  const [deleteVehicle, setDeleteVehicle] = useState<any>(null);

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

  const addMutation = useMutation({
    mutationFn: async (values: typeof addForm) => {
      const { error } = await supabase.from("vehicles").insert({
        plate: values.plate.toUpperCase(),
        model: values.model,
        year: Number(values.year),
        km: Number(values.km),
        next_oil_change: Number(values.next_oil_change),
        last_oil_change: values.last_oil_change || null,
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles-oil"] });
      toast({ title: "Veículo adicionado com sucesso" });
      setShowAddDialog(false);
      setAddForm({ plate: "", model: "", year: "", km: "0", next_oil_change: "0", last_oil_change: "" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar veículo", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles-oil"] });
      toast({ title: "Veículo excluído com sucesso" });
      setDeleteVehicle(null);
    },
    onError: () => {
      toast({ title: "Erro ao excluir veículo", variant: "destructive" });
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.plate || !addForm.model || !addForm.year) {
      toast({ title: "Preencha placa, modelo e ano", variant: "destructive" });
      return;
    }
    addMutation.mutate(addForm);
  };

  const sorted = [...vehicles].sort((a, b) => ((a.next_oil_change || 0) - a.km) - ((b.next_oil_change || 0) - b.km));

  const criticalVehicles = vehicles.filter((v) => {
    const remaining = (v.next_oil_change || 0) - v.km;
    return remaining < 1000;
  });

  const warningVehicles = vehicles.filter((v) => {
    const remaining = (v.next_oil_change || 0) - v.km;
    return remaining >= 1000 && remaining < 3000;
  });

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Controle de Óleo</h1>
          <p className="text-muted-foreground mt-1">Monitoramento de troca de óleo dos veículos</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus size={18} /> Adicionar Veículo
          </Button>
        )}
      </div>

      {criticalVehicles.length > 0 && (
        <Alert variant="destructive" className="mb-4 border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold">
            ⚠️ {criticalVehicles.length} veículo(s) com troca de óleo urgente!
          </AlertTitle>
          <AlertDescription>
            {criticalVehicles.map((v) => (
              <span key={v.id} className="inline-flex items-center mr-3 font-mono font-semibold">
                {v.plate} ({((v.next_oil_change || 0) - v.km).toLocaleString("pt-BR")} km restantes)
              </span>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {warningVehicles.length > 0 && (
        <Alert className="mb-4 border-warning/50 bg-warning/10">
          <Bell className="h-5 w-5 text-warning" />
          <AlertTitle className="font-bold text-warning">
            {warningVehicles.length} veículo(s) se aproximando da troca de óleo
          </AlertTitle>
          <AlertDescription>
            {warningVehicles.map((v) => (
              <span key={v.id} className="inline-flex items-center mr-3 font-mono font-semibold text-warning">
                {v.plate} ({((v.next_oil_change || 0) - v.km).toLocaleString("pt-BR")} km restantes)
              </span>
            ))}
          </AlertDescription>
        </Alert>
      )}

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
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteVehicle(v)}
                        className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
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

      {/* Edit Dialog */}
      <Dialog open={!!editVehicle} onOpenChange={(open) => !open && setEditVehicle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Óleo — {editVehicle?.plate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>KM Atual</Label>
              <Input type="number" value={formData.km} onChange={(e) => setFormData((p) => ({ ...p, km: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Próxima Troca (KM)</Label>
              <Input type="number" value={formData.next_oil_change} onChange={(e) => setFormData((p) => ({ ...p, next_oil_change: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Última Troca</Label>
              <Input type="date" value={formData.last_oil_change} onChange={(e) => setFormData((p) => ({ ...p, last_oil_change: e.target.value }))} />
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

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Veículo</DialogTitle>
            <DialogDescription>Preencha os dados do novo veículo</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label>Placa</Label>
              <Input placeholder="ABC-1234" value={addForm.plate} onChange={(e) => setAddForm((p) => ({ ...p, plate: e.target.value }))} required />
            </div>
            <div>
              <Label>Modelo</Label>
              <Input placeholder="Ex: Fiat Strada" value={addForm.model} onChange={(e) => setAddForm((p) => ({ ...p, model: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ano</Label>
                <Input type="number" placeholder="2024" value={addForm.year} onChange={(e) => setAddForm((p) => ({ ...p, year: e.target.value }))} required />
              </div>
              <div>
                <Label>KM Atual</Label>
                <Input type="number" value={addForm.km} onChange={(e) => setAddForm((p) => ({ ...p, km: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Próx. Troca (KM)</Label>
                <Input type="number" value={addForm.next_oil_change} onChange={(e) => setAddForm((p) => ({ ...p, next_oil_change: e.target.value }))} />
              </div>
              <div>
                <Label>Última Troca</Label>
                <Input type="date" value={addForm.last_oil_change} onChange={(e) => setAddForm((p) => ({ ...p, last_oil_change: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteVehicle} onOpenChange={(open) => !open && setDeleteVehicle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir veículo {deleteVehicle?.plate}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O veículo será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteVehicle && deleteMutation.mutate(deleteVehicle.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default OilControl;
