import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ChecklistPayload {
  vehiclePlate: string;
  vehicleModel: string;
  driverName: string;
  km: string;
  checks: Record<string, string>;
  checklistItems: { id: string; label: string }[];
  observations: string;
  photoUrls: string[];
  checklistType?: string;
  signatureUrl?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      vehiclePlate,
      vehicleModel,
      driverName,
      km,
      checks,
      checklistItems,
      observations,
      photoUrls,
      checklistType,
      signatureUrl,
    }: ChecklistPayload = await req.json();

    const problems = checklistItems.filter((item) => checks[item.id] === "problema");
    const okItems = checklistItems.filter((item) => checks[item.id] === "ok");
    const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    const typeLabel = checklistType || "Checklist";
    const typeBadgeColor = checklistType === "Devolução" ? "#2563eb" : "#f59e0b";

    const problemRows =
      problems.length > 0
        ? problems
            .map(
              (p) =>
                `<tr><td style="padding:8px;border:1px solid #e5e7eb;color:#dc2626;">⚠ ${p.label}</td><td style="padding:8px;border:1px solid #e5e7eb;color:#dc2626;font-weight:bold;">PROBLEMA</td></tr>`,
            )
            .join("")
        : "";

    const okRows = okItems
      .map(
        (item) =>
          `<tr><td style="padding:8px;border:1px solid #e5e7eb;">${item.label}</td><td style="padding:8px;border:1px solid #e5e7eb;color:#16a34a;font-weight:bold;">OK</td></tr>`,
      )
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:#1e293b;color:#ffffff;padding:24px;text-align:center;">
          <h1 style="margin:0;font-size:22px;">Checklist Veicular — ${typeLabel}</h1>
          <span style="display:inline-block;margin-top:8px;padding:4px 12px;border-radius:12px;background:${typeBadgeColor};color:#fff;font-size:13px;font-weight:bold;">${typeLabel}</span>
          <p style="margin:8px 0 0;opacity:0.8;font-size:14px;">${now}</p>
        </div>
        
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr>
              <td style="padding:8px;font-weight:bold;color:#64748b;">Veículo:</td>
              <td style="padding:8px;">${vehiclePlate} — ${vehicleModel}</td>
            </tr>
            <tr>
              <td style="padding:8px;font-weight:bold;color:#64748b;">Motorista:</td>
              <td style="padding:8px;">${driverName}</td>
            </tr>
            <tr>
              <td style="padding:8px;font-weight:bold;color:#64748b;">KM Atual:</td>
              <td style="padding:8px;">${km}</td>
            </tr>
          </table>

          ${
            problems.length > 0
              ? `
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:20px;">
            <h3 style="margin:0 0 8px;color:#dc2626;">⚠ ${problems.length} problema${problems.length > 1 ? "s" : ""} identificado${problems.length > 1 ? "s" : ""}</h3>
            <ul style="margin:0;padding-left:20px;">
              ${problems.map((p) => `<li style="color:#dc2626;">${p.label}</li>`).join("")}
            </ul>
          </div>
          `
              : `
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:20px;">
            <h3 style="margin:0;color:#16a34a;">✅ Todos os itens OK</h3>
          </div>
          `
          }

          <h3 style="margin:0 0 12px;color:#1e293b;">Itens de Inspeção</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Item</th>
                <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${problemRows}${okRows}
            </tbody>
          </table>

          ${
            observations
              ? `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;">
            <h3 style="margin:0 0 8px;color:#1e293b;">Observações</h3>
            <p style="margin:0;color:#475569;">${observations}</p>
          </div>
          `
              : ""
          }

          ${
            photoUrls && photoUrls.length > 0
              ? `
          <div style="margin-bottom:20px;">
            <h3 style="margin:0 0 12px;color:#1e293b;">📷 Fotos de Avarias (${photoUrls.length})</h3>
            <div>
              ${photoUrls.map((url: string, i: number) => `<a href="${url}" target="_blank" style="display:inline-block;margin:0 8px 8px 0;"><img src="${url}" alt="Avaria ${i + 1}" style="width:150px;height:150px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;" /></a>`).join("")}
            </div>
          </div>
          `
              : ""
          }

          <div style="background:#fef9f0;border:1px solid #f59e0b;border-radius:8px;padding:16px;margin-bottom:20px;">
            <h3 style="margin:0 0 8px;color:#b45309;">📋 Termo de Responsabilidade</h3>
            <ul style="margin:0;padding-left:20px;font-size:13px;color:#78350f;line-height:1.7;">
              <li>Quaisquer <strong>danos causados</strong> ao veículo durante o período de utilização serão de inteira responsabilidade do motorista.</li>
              <li>Os custos de reparo dos danos identificados na devolução, que não constavam na retirada, <strong>serão descontados</strong> conforme política da empresa.</li>
              <li>Compromete-se a utilizar o veículo de forma adequada, respeitando as leis de trânsito e normas internas.</li>
              <li>Multas de trânsito ocorridas durante o período de uso são de responsabilidade do motorista.</li>
            </ul>
            <p style="margin:12px 0 0;font-size:13px;color:#16a34a;font-weight:bold;">✅ Termos aceitos pelo motorista</p>
          </div>

          ${
            signatureUrl
              ? `
          <div style="margin-bottom:20px;">
            <h3 style="margin:0 0 12px;color:#1e293b;">✍️ Assinatura do Motorista</h3>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;display:inline-block;">
              <img src="${signatureUrl}" alt="Assinatura do motorista" style="max-width:300px;height:auto;" />
            </div>
          </div>
          `
              : ""
          }
        </div>

        <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#94a3b8;">
          Enviado automaticamente pelo sistema de gestão de frota
        </div>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: "Frota <noreply@jng.com.br>",
      to: ["noreply@jng.com.br", "compras@jng.com.br"],
      subject: `${typeLabel} — ${vehiclePlate} ${problems.length > 0 ? `(${problems.length} problema${problems.length > 1 ? "s" : ""})` : "(Tudo OK)"}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending checklist email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
