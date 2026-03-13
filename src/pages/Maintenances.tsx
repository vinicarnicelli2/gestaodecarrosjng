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
import { Plus, Pencil, Trash2, Filter } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

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
  const [filterVehicle, setFilterVehicle] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");

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

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    maintenances.forEach((m) => {
      const d = new Date(m.date);
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    });
    return Array.from(months).sort().reverse();
  }, [maintenances]);

  const availableTypes = useMemo(() => {
    return Array.from(new Set(maintenances.map((m) => m.type))).sort();
  }, [maintenances]);

  const filteredMaintenances = useMemo(() => {
    return maintenances.filter((m) => {
      if (filterVehicle !== "all" && m.vehicle_id !== filterVehicle) return false;
      if (filterType !== "all" && m.type !== filterType) return false;
      if (filterMonth !== "all") {
        const d = new Date(m.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (key !== filterMonth) return false;
      }
      return true;
    });
  }, [maintenances, filterVehicle, filterType, filterMonth]);

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

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="w-48">
          <Select value={filterVehicle} onValueChange={setFilterVehicle}>
            <SelectTrigger><Filter className="h-4 w-4 mr-2 text-muted-foreground" /><SelectValue placeholder="Veículo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os veículos</SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.plate} - {v.model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-44">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {availableTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger><SelectValue placeholder="Mês" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {availableMonths.map((m) => {
                const [y, mo] = m.split("-");
                return <SelectItem key={m} value={m}>{mo}/{y}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
        {(filterVehicle !== "all" || filterType !== "all" || filterMonth !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterVehicle("all"); setFilterType("all"); setFilterMonth("all"); }}>
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Relatório de Custos */}
      {filteredMaintenances.length > 0 && (() => {
        const totalCost = filteredMaintenances.reduce((sum, m) => sum + Number(m.cost), 0);
        const completedCost = filteredMaintenances.filter(m => m.status === "concluída").reduce((sum, m) => sum + Number(m.cost), 0);
        const pendingCost = filteredMaintenances.filter(m => m.status !== "concluída").reduce((sum, m) => sum + Number(m.cost), 0);
        const costByType = filteredMaintenances.reduce((acc, m) => {
          acc[m.type] = (acc[m.type] || 0) + Number(m.cost);
          return acc;
        }, {} as Record<string, number>);
        const topType = Object.entries(costByType).sort((a, b) => b[1] - a[1])[0];

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Custo Total</p>
              <p className="text-2xl font-bold text-foreground">R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground mt-1">{filteredMaintenances.length} manutenções</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Concluídas</p>
              <p className="text-2xl font-bold text-green-600">R$ {completedCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground mt-1">{filteredMaintenances.filter(m => m.status === "concluída").length} finalizadas</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pendentes / Em andamento</p>
              <p className="text-2xl font-bold text-amber-600">R$ {pendingCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <p className="text-xs text-muted-foreground mt-1">{filteredMaintenances.filter(m => m.status !== "concluída").length} em aberto</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Maior Custo por Tipo</p>
              <p className="text-2xl font-bold text-foreground">{topType ? topType[0] : "-"}</p>
              <p className="text-xs text-muted-foreground mt-1">{topType ? `R$ ${topType[1].toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "-"}</p>
            </div>
          </div>
        );
      })()}

      {/* Gráfico de Custos por Mês */}
      {filteredMaintenances.length > 0 && (() => {
        const monthlyData: Record<string, number> = {};
        filteredMaintenances.forEach((m) => {
          const d = new Date(m.date);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          monthlyData[key] = (monthlyData[key] || 0) + Number(m.cost);
        });
        const chartData = Object.entries(monthlyData)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-12)
          .map(([month, total]) => {
            const [y, m] = month.split("-");
            return { month: `${m}/${y}`, total };
          });
        const chartConfig = {
          total: { label: "Custo (R$)", color: "hsl(var(--primary))" },
        };
        return (
          <div className="bg-card rounded-lg border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Custos por Mês</h2>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `R$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        );
      })()}

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
              ) : filteredMaintenances.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Nenhuma manutenção encontrada</td></tr>
              ) : (
                filteredMaintenances.map((m, i) => (
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
