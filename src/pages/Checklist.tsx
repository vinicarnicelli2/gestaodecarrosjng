import { useState, useCallback, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { ClipboardCheck, Send, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PhotoUpload from "@/components/checklist/PhotoUpload";
import SignaturePad from "@/components/checklist/SignaturePad";

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

interface ReservationOption {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  hasPickupChecklist: boolean;
  hasReturnChecklist: boolean;
}

const Checklist = () => {
  const { user } = useAuth();
  const [reservationId, setReservationId] = useState("");
  const [checklistType, setChecklistType] = useState<"retirada" | "devolucao" | "">("");
  const [km, setKm] = useState("");
  const [checks, setChecks] = useState<Record<string, CheckValue>>(
    Object.fromEntries(checklistItems.map((item) => [item.id, ""]))
  );
  const [observations, setObservations] = useState("");
  const [sending, setSending] = useState(false);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<{ id: string; plate: string; model: string }[]>([]);
  const [reservations, setReservations] = useState<ReservationOption[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string }[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      const [vehRes, drvRes, resRes, chkRes, profRes] = await Promise.all([
        supabase.from("vehicles").select("id, plate, model").order("plate"),
        supabase.from("drivers").select("id, name").order("name"),
        supabase.from("reservations").select("*").eq("status", "aprovada").order("start_date"),
        supabase.from("checklists").select("reservation_id, checklist_type"),
        supabase.from("profiles").select("user_id, display_name"),
      ]);

      setVehicles(vehRes.data ?? []);
      setDrivers(drvRes.data ?? []);

      const pMap: Record<string, string> = {};
      (profRes.data ?? []).forEach((p: any) => { pMap[p.user_id] = p.display_name; });
      setProfiles(pMap);

      // Build reservation options with checklist status
      const existingChecklists = chkRes.data ?? [];
      const resOptions: ReservationOption[] = (resRes.data ?? []).map((r: any) => {
        const hasPickup = existingChecklists.some(
          (c: any) => c.reservation_id === r.id && c.checklist_type === "retirada"
        );
        const hasReturn = existingChecklists.some(
          (c: any) => c.reservation_id === r.id && c.checklist_type === "devolucao"
        );
        return {
          id: r.id,
          vehicle_id: r.vehicle_id,
          start_date: r.start_date,
          end_date: r.end_date,
          reason: r.reason,
          status: r.status,
          hasPickupChecklist: hasPickup,
          hasReturnChecklist: hasReturn,
        };
      });

      // Only show reservations that still need at least one checklist
      setReservations(resOptions.filter(r => !r.hasPickupChecklist || !r.hasReturnChecklist));
    };

    fetchData();
  }, []);

  // Auto-detect checklist type when reservation is selected
  useEffect(() => {
    if (!reservationId) {
      setChecklistType("");
      return;
    }
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;

    if (!res.hasPickupChecklist) {
      setChecklistType("retirada");
    } else if (!res.hasReturnChecklist) {
      setChecklistType("devolucao");
    }
  }, [reservationId, reservations]);

  const handleCheck = (id: string, value: CheckValue) => {
    setChecks((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddPhotos = useCallback((files: FileList) => {
    const remaining = 5 - photos.length;
    const newFiles = Array.from(files).slice(0, remaining);
    const newPhotos = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }, [photos.length]);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const uploadPhotos = async (): Promise<string[]> => {
    const urls: string[] = [];
    const timestamp = Date.now();
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const ext = photo.file.name.split(".").pop() || "jpg";
      const path = `${timestamp}_${i}.${ext}`;
      const { error } = await supabase.storage
        .from("checklist-photos")
        .upload(path, photo.file, { contentType: photo.file.type });
      if (error) throw new Error(`Erro ao enviar foto ${i + 1}: ${error.message}`);
      const { data: urlData } = supabase.storage.from("checklist-photos").getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const selectedReservation = reservations.find(r => r.id === reservationId);
  const selectedVehicle = selectedReservation ? vehicles.find(v => v.id === selectedReservation.vehicle_id) : null;

  const allFilled = Object.values(checks).every((v) => v !== "") && reservationId && checklistType && km && acceptedTerms && !!signatureDataUrl;

  const handleSubmit = async () => {
    if (!allFilled) {
      toast.error("Preencha todos os campos do checklist.");
      return;
    }

    setSending(true);

    try {
      // Upload signature
      let signatureUrl = "";
      if (signatureDataUrl) {
        const blob = await (await fetch(signatureDataUrl)).blob();
        const sigPath = `signatures/${Date.now()}_signature.png`;
        const { error: sigError } = await supabase.storage
          .from("checklist-photos")
          .upload(sigPath, blob, { contentType: "image/png" });
        if (sigError) throw new Error("Erro ao enviar assinatura: " + sigError.message);
        const { data: sigUrlData } = supabase.storage.from("checklist-photos").getPublicUrl(sigPath);
        signatureUrl = sigUrlData.publicUrl;
      }

      let photoUrls: string[] = [];
      if (photos.length > 0) {
        setUploadingPhotos(true);
        photoUrls = await uploadPhotos();
        setUploadingPhotos(false);
      }

      const driverName = user ? (profiles[user.id] ?? user.email ?? "Operador") : "Operador";
      const typeLabel = checklistType === "retirada" ? "Retirada" : "Devolução";

      const { error } = await supabase.functions.invoke("send-checklist", {
        body: {
          vehiclePlate: selectedVehicle?.plate ?? "",
          vehicleModel: selectedVehicle?.model ?? "",
          driverName,
          km,
          checks,
          checklistItems,
          observations,
          photoUrls,
          checklistType: typeLabel,
        },
      });

      if (error) throw error;

      // Save to database
      const problemCount = Object.values(checks).filter((v) => v === "problema").length;
      const { error: dbError } = await supabase.from("checklists").insert({
        vehicle_plate: selectedVehicle?.plate ?? "",
        vehicle_model: selectedVehicle?.model ?? "",
        driver_name: driverName,
        km,
        checks,
        observations,
        photo_urls: photoUrls,
        problem_count: problemCount,
        user_id: user?.id,
        checklist_type: checklistType,
        reservation_id: reservationId,
      });

      if (dbError) console.error("Erro ao salvar no banco:", dbError);

      toast.success(`Checklist de ${typeLabel} enviado com sucesso!`);

      // Reset form
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
      setReservationId("");
      setChecklistType("");
      setAcceptedTerms(false);
      setKm("");
      setChecks(Object.fromEntries(checklistItems.map((item) => [item.id, ""])));
      setObservations("");
      setPhotos([]);
    } catch (err: any) {
      console.error("Erro ao enviar checklist:", err);
      toast.error(err.message || "Erro ao enviar checklist. Tente novamente.");
      setUploadingPhotos(false);
    } finally {
      setSending(false);
    }
  };

  const problemCount = Object.values(checks).filter((v) => v === "problema").length;

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Checklist Veicular</h1>
        <p className="text-muted-foreground mt-1">
          Selecione uma reserva aprovada para preencher o checklist de retirada ou devolução
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Reservation selection */}
        <div className="bg-card rounded-lg border p-6 animate-fade-in space-y-4">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <ClipboardCheck size={20} className="text-accent" />
            Reserva e Informações
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                Reserva Aprovada
              </label>
              <select
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Selecione uma reserva...</option>
                {reservations.map((r) => {
                  const v = vehicles.find(veh => veh.id === r.vehicle_id);
                  const pending = !r.hasPickupChecklist ? "Retirada" : "Devolução";
                  return (
                    <option key={r.id} value={r.id}>
                      {v?.plate} — {v?.model} • {new Date(r.start_date).toLocaleDateString("pt-BR")} → {new Date(r.end_date).toLocaleDateString("pt-BR")} ({pending} pendente)
                    </option>
                  );
                })}
              </select>
            </div>

            {reservationId && checklistType && (
              <div className="sm:col-span-2">
                <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                  checklistType === "retirada" 
                    ? "bg-accent/10 border-accent/30" 
                    : "bg-primary/10 border-primary/30"
                }`}>
                  {checklistType === "retirada" ? (
                    <ArrowUpRight size={20} className="text-accent" />
                  ) : (
                    <ArrowDownLeft size={20} className="text-primary" />
                  )}
                  <div>
                    <p className="font-semibold text-sm">
                      Checklist de {checklistType === "retirada" ? "Retirada" : "Devolução"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {checklistType === "retirada"
                        ? "Inspeção antes da saída do veículo"
                        : "Inspeção no retorno do veículo"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedVehicle && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                  Veículo
                </label>
                <div className="w-full rounded-lg border border-input bg-muted/50 px-3 py-2.5 text-sm">
                  {selectedVehicle.plate} — {selectedVehicle.model}
                </div>
              </div>
            )}

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

        {/* Photo Upload */}
        <PhotoUpload
          photos={photos}
          uploading={uploadingPhotos}
          onAdd={handleAddPhotos}
          onRemove={handleRemovePhoto}
        />

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

        {/* Termo de Aceite */}
        <div className="bg-card rounded-lg border border-destructive/30 p-6 animate-fade-in space-y-4">
          <h2 className="font-display font-semibold text-lg text-destructive">
            Termo de Responsabilidade
          </h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              Ao assinar este termo, declaro que recebi o veículo nas condições descritas acima e estou ciente de que:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Quaisquer <strong className="text-foreground">danos causados</strong> ao veículo durante o período de utilização serão de minha inteira responsabilidade.</li>
              <li>Os custos de reparo dos danos identificados na devolução, que não constavam na retirada, <strong className="text-foreground">serão descontados</strong> conforme política da empresa.</li>
              <li>Comprometo-me a utilizar o veículo de forma adequada, respeitando as leis de trânsito e normas internas.</li>
              <li>Multas de trânsito ocorridas durante o período de uso são de minha responsabilidade.</li>
            </ul>
          </div>
          <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-border">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-input accent-accent"
            />
            <span className="text-sm font-medium">
              Li e aceito os termos de responsabilidade acima. Estou ciente de que danos causados ao veículo serão descontados.
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!allFilled || sending}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={18} />
          {sending
            ? uploadingPhotos
              ? "Enviando fotos..."
              : "Enviando checklist..."
            : `Enviar Checklist de ${checklistType === "retirada" ? "Retirada" : checklistType === "devolucao" ? "Devolução" : "..."}`}
        </button>
      </div>
    </AppLayout>
  );
};

export default Checklist;
