import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { mockVehicles, mockDrivers } from "@/lib/data";
import { ClipboardCheck, Send } from "lucide-react";
import { toast } from "sonner";

const checklistItems = [
  { id: "pneus", label: "Pneus (calibragem e estado)" },
  { id: "farois", label: "Faróis e lanternas" },
  { id: "freios", label: "Sistema de freios" },
  { id: "oleo", label: "Nível de óleo" },
  { id: "agua", label: "Nível de água do radiador" },
  { id: "limpador", label: "Limpador de para-brisa" },
  { id: "retrovisor", label: "Retrovisores" },
  { id: "cinto", label: "Cintos de segurança" },
  { id: "extintor", label: "Extintor de incêndio" },
  { id: "triangulo", label: "Triângulo de sinalização" },
  { id: "macaco", label: "Macaco e chave de roda" },
  { id: "estepe", label: "Estepe" },
  { id: "documentos", label: "Documentos do veículo" },
  { id: "avarias", label: "Sem avarias na carroceria" },
  { id: "painel", label: "Painel sem alertas" },
];

type CheckValue = "ok" | "problema" | "";

const Checklist = () => {
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [km, setKm] = useState("");
  const [checks, setChecks] = useState<Record<string, CheckValue>>(
    Object.fromEntries(checklistItems.map((item) => [item.id, ""]))
  );
  const [observations, setObservations] = useState("");
  const [sending, setSending] = useState(false);

  const handleCheck = (id: string, value: CheckValue) => {
    setChecks((prev) => ({ ...prev, [id]: value }));
  };

  const allFilled = Object.values(checks).every((v) => v !== "") && vehicleId && driverId && km;

  const handleSubmit = async () => {
    if (!allFilled) {
      toast.error("Preencha todos os campos do checklist.");
      return;
    }

    setSending(true);

    // Simulate sending email to compras@jng.com.br
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const vehicle = mockVehicles.find((v) => v.id === vehicleId);
    const driver = mockDrivers.find((d) => d.id === driverId);
    const problems = checklistItems.filter((item) => checks[item.id] === "problema");

    console.log("Checklist enviado para compras@jng.com.br", {
      vehicle: vehicle?.plate,
      driver: driver?.name,
      km,
      checks,
      observations,
      problems: problems.map((p) => p.label),
    });

    toast.success("Checklist enviado com sucesso para compras@jng.com.br!");

    // Reset form
    setVehicleId("");
    setDriverId("");
    setKm("");
    setChecks(Object.fromEntries(checklistItems.map((item) => [item.id, ""])));
    setObservations("");
    setSending(false);
  };

  const problemCount = Object.values(checks).filter((v) => v === "problema").length;

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Checklist Veicular</h1>
        <p className="text-muted-foreground mt-1">
          Preencha a inspeção e envie para{" "}
          <span className="font-medium text-foreground">compras@jng.com.br</span>
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Vehicle & Driver selection */}
        <div className="bg-card rounded-lg border p-6 animate-fade-in space-y-4">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <ClipboardCheck size={20} className="text-accent" />
            Informações Gerais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Veículo
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione...</option>
                {mockVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate} — {v.model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Motorista
              </label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione...</option>
                {mockDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                KM Atual
              </label>
              <input
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="Ex: 45200"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Checklist items */}
        <div className="bg-card rounded-lg border p-6 animate-fade-in space-y-1">
          <h2 className="font-display font-semibold text-lg mb-4">Itens de Inspeção</h2>

          <div className="space-y-1">
            {checklistItems.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  checks[item.id] === "problema"
                    ? "bg-destructive/10"
                    : checks[item.id] === "ok"
                    ? "bg-success/5"
                    : i % 2 === 0
                    ? "bg-muted/30"
                    : ""
                }`}
              >
                <span className="text-sm font-medium">{item.label}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCheck(item.id, "ok")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      checks[item.id] === "ok"
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground hover:bg-success/20"
                    }`}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCheck(item.id, "problema")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      checks[item.id] === "problema"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground hover:bg-destructive/20"
                    }`}
                  >
                    Problema
                  </button>
                </div>
              </div>
            ))}
          </div>

          {problemCount > 0 && (
            <p className="text-sm text-destructive font-medium mt-3 pt-3 border-t">
              ⚠ {problemCount} {problemCount === 1 ? "problema identificado" : "problemas identificados"}
            </p>
          )}
        </div>

        {/* Observations */}
        <div className="bg-card rounded-lg border p-6 animate-fade-in">
          <h2 className="font-display font-semibold text-lg mb-3">Observações</h2>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Descreva problemas encontrados, peças necessárias, etc."
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">{observations.length}/500</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!allFilled || sending}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={18} />
          {sending ? "Enviando..." : "Enviar Checklist para compras@jng.com.br"}
        </button>
      </div>
    </AppLayout>
  );
};

export default Checklist;
