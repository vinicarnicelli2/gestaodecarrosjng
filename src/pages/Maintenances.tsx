import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface MaintenanceRow {
  id: string;
  vehicle_id: string;
  vehicle_plate: string;
  type: string;
  description: string;
  date: string;
  cost: number;
  status: string;
  user_id: string;
  created_at: string;
}

const emptyForm = {
  vehicle_id: "",
  vehicle_plate: "",
  type: "",
  description: "",
  date: "",
  cost: 0,
  status: "agendada",
};

const Maintenances = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: maintenances = [], isLoading } = useQuery({
    queryKey: ["maintenances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenances")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as MaintenanceRow[];
    },
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("id, plate, model");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (formData: typeof emptyForm & { id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const payload = {
        vehicle_id: formData.vehicle_id,
        vehicle_plate: formData.vehicle_plate,
        type: formData.type,
        description: formData.description,
        date: formData.date,
        cost: formData.cost,
        status: formData.status,
        user_id: user.id,
      };

      if (formData.id) {
        const { error } = await supabase.from("maintenances").update(payload).eq("id", formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("maintenances").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
      toast.success(editingId ? "Manutenção atualizada!" : "Manutenção criada!");
      closeDialog();
    },
    onError: () => toast.error("Erro ao salvar manutenção"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("maintenances").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
      toast.success("Manutenção excluída!");
    },
    onError: () => toast.error("Erro ao excluir manutenção"),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (m: MaintenanceRow) => {
    setEditingId(m.id);
    setForm({
      vehicle_id: m.vehicle_id,
      vehicle_plate: m.vehicle_plate,
      type: m.type,
      description: m.description,
      date: m.date,
      cost: m.cost,
      status: m.status,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleVehicleChange = (vehicleId: string) => {
    const v = vehicles.find((v) => v.id === vehicleId);
    setForm((f) => ({ ...f, vehicle_id: vehicleId, vehicle_plate: v?.plate || "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicle_id || !form.type || !form.date) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    saveMutation.mutate(editingId ? { ...form, id: editingId } : form);
  };

  return (
    <AppLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Manutenções</h1>
          <p className="text-muted-foreground mt-1">Histórico e agendamento de manutenções</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Nova Manutenção
        </Button>
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
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Carregando...</td></tr>
              ) : maintenances.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Nenhuma manutenção cadastrada</td></tr>
              ) : (
                maintenances.map((m, i) => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors" style={{ animationDelay: `${i * 50}ms` }}>
                    <td className="px-6 py-4 font-mono font-semibold text-sm">{m.vehicle_plate}</td>
                    <td className="px-6 py-4 text-sm font-medium">{m.type}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{m.description}</td>
                    <td className="px-6 py-4 text-sm">{new Date(m.date).toLocaleDateString("pt-BR")}</td>
                    <td className="px-6 py-4 text-sm font-medium">R$ {Number(m.cost).toLocaleString("pt-BR")}</td>
                    <td className="px-6 py-4"><StatusBadge status={m.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(m.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Manutenção" : "Nova Manutenção"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Veículo *</Label>
              <Select value={form.vehicle_id} onValueChange={handleVehicleChange}>
                <SelectTrigger><SelectValue placeholder="Selecione o veículo" /></SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.plate} - {v.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Tipo de manutenção" /></SelectTrigger>
                <SelectContent>
                  {["Revisão", "Freios", "Pneus", "Elétrica", "Suspensão", "Motor", "Funilaria", "Outro"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Detalhes da manutenção" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Custo (R$)</Label>
                <Input type="number" min={0} step={0.01} value={form.cost} onChange={(e) => setForm((f) => ({ ...f, cost: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="em andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluída">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Maintenances;
