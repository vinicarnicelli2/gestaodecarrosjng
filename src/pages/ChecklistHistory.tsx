import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { History, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface ChecklistRecord {
  id: string;
  vehicle_plate: string;
  vehicle_model: string;
  driver_name: string;
  km: string;
  checks: Record<string, string>;
  observations: string;
  photo_urls: string[];
  problem_count: number;
  created_at: string;
}

const checklistLabels: Record<string, string> = {
  pneus: "Pneus (calibragem e estado)",
  farois: "Faróis e lanternas",
  freios: "Sistema de freios",
  oleo: "Nível de óleo",
  agua: "Nível de água do radiador",
  limpador: "Limpador de para-brisa",
  retrovisor: "Retrovisores",
  cinto: "Cintos de segurança",
  extintor: "Extintor de incêndio",
  triangulo: "Triângulo de sinalização",
  macaco: "Macaco e chave de roda",
  estepe: "Estepe",
  documentos: "Documentos do veículo",
  avarias: "Sem avarias na carroceria",
  painel: "Painel sem alertas",
};

/** Resolve a storage path (or legacy full URL) to a signed URL */
async function resolveUrl(pathOrUrl: string): Promise<string> {
  if (!pathOrUrl) return "";
  if (pathOrUrl.startsWith("http")) return pathOrUrl; // legacy full URL
  const { data, error } = await supabase.storage
    .from("checklist-photos")
    .createSignedUrl(pathOrUrl, 60 * 60); // 1 hour
  if (error || !data?.signedUrl) return "";
  return data.signedUrl;
}

const ChecklistHistory = () => {
  const [records, setRecords] = useState<ChecklistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string[]>>({});
  const [loadingUrls, setLoadingUrls] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setRecords(data as unknown as ChecklistRecord[]);
      setLoading(false);
    };
    fetchRecords();
  }, []);

  const loadSignedUrls = useCallback(async (record: ChecklistRecord) => {
    if (signedUrls[record.id]) return;
    setLoadingUrls(record.id);
    const urls = await Promise.all(
      (record.photo_urls || []).map((p) => resolveUrl(p)),
    );
    setSignedUrls((prev) => ({ ...prev, [record.id]: urls.filter(Boolean) }));
    setLoadingUrls(null);
  }, [signedUrls]);

  const handleToggle = (record: ChecklistRecord) => {
    const willExpand = expandedId !== record.id;
    setExpandedId(willExpand ? record.id : null);
    if (willExpand && record.photo_urls?.length) {
      loadSignedUrls(record);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <History size={28} className="text-accent" />
          Histórico de Checklists
        </h1>
        <p className="text-muted-foreground mt-1">
          Consulte todos os checklists enviados
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-lg border p-6 animate-pulse h-24" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="bg-card rounded-lg border p-12 text-center">
          <p className="text-muted-foreground">Nenhum checklist enviado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-4xl">
          {records.map((record) => {
            const isExpanded = expandedId === record.id;
            const checks = record.checks as Record<string, string>;
            const resolvedUrls = signedUrls[record.id] || [];

            return (
              <div
                key={record.id}
                className="bg-card rounded-lg border overflow-hidden animate-fade-in"
              >
                <button
                  onClick={() => handleToggle(record)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-semibold text-sm">
                      {record.vehicle_plate} — {record.vehicle_model}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {record.driver_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(record.created_at)}
                    </span>
                    {record.problem_count > 0 ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                        ⚠ {record.problem_count} problema{record.problem_count > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">
                        ✅ Tudo OK
                      </span>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {isExpanded && (
                  <div className="border-t px-5 pb-5 pt-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">KM:</span>{" "}
                        <span className="font-medium">{record.km}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold mb-2">Itens de Inspeção</h3>
                      {Object.entries(checks).map(([key, value]) => (
                        <div
                          key={key}
                          className={`flex items-center justify-between px-3 py-2 rounded text-xs ${
                            value === "problema" ? "bg-destructive/10" : "bg-muted/20"
                          }`}
                        >
                          <span>{checklistLabels[key] || key}</span>
                          <span
                            className={`font-semibold ${
                              value === "problema" ? "text-destructive" : "text-success"
                            }`}
                          >
                            {value === "problema" ? "PROBLEMA" : "OK"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {record.observations && (
                      <div>
                        <h3 className="text-sm font-semibold mb-1">Observações</h3>
                        <p className="text-sm text-muted-foreground">{record.observations}</p>
                      </div>
                    )}

                    {record.photo_urls && record.photo_urls.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">
                          Fotos ({record.photo_urls.length})
                        </h3>
                        {loadingUrls === record.id ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 size={16} className="animate-spin" />
                            Carregando fotos...
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {resolvedUrls.map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-20 h-20 rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
                              >
                                <img
                                  src={url}
                                  alt={`Foto ${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default ChecklistHistory;
