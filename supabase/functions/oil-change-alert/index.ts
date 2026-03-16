import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const resend = new Resend(resendApiKey);

    // Fetch all vehicles
    const { data: vehicles, error: vError } = await supabase
      .from("vehicles")
      .select("*");

    if (vError) throw vError;

    // Filter critical vehicles (< 1000 km remaining)
    const critical = (vehicles || []).filter(
      (v: any) => (v.next_oil_change || 0) - v.km < 1000
    );

    if (critical.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhum veículo crítico encontrado" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch managers to notify
    const { data: managers, error: mError } = await supabase
      .from("managers")
      .select("name, email");

    if (mError) throw mError;

    if (!managers || managers.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nenhum gestor cadastrado para notificar" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build vehicle rows for email
    const vehicleRows = critical
      .map((v: any) => {
        const remaining = (v.next_oil_change || 0) - v.km;
        return `
          <tr>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-weight:bold;font-family:monospace;">${v.plate}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${v.model}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${v.km.toLocaleString("pt-BR")} km</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${(v.next_oil_change || 0).toLocaleString("pt-BR")} km</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;color:#dc2626;font-weight:bold;">${remaining.toLocaleString("pt-BR")} km</td>
          </tr>`;
      })
      .join("");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;background:#ffffff;">
        <div style="background:#dc2626;color:#ffffff;padding:24px;text-align:center;">
          <h1 style="margin:0;font-size:22px;">⚠️ Alerta de Troca de Óleo</h1>
        </div>
        <div style="padding:24px;">
          <p style="color:#333;font-size:15px;">
            ${critical.length} veículo(s) estão com <strong>menos de 1.000 km</strong> restantes para a próxima troca de óleo:
          </p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:10px;text-align:left;color:#64748b;font-size:13px;">Placa</th>
                <th style="padding:10px;text-align:left;color:#64748b;font-size:13px;">Modelo</th>
                <th style="padding:10px;text-align:left;color:#64748b;font-size:13px;">KM Atual</th>
                <th style="padding:10px;text-align:left;color:#64748b;font-size:13px;">Próx. Troca</th>
                <th style="padding:10px;text-align:left;color:#64748b;font-size:13px;">Restante</th>
              </tr>
            </thead>
            <tbody>
              ${vehicleRows}
            </tbody>
          </table>
          <p style="color:#555;font-size:14px;">Acesse o sistema para agendar as manutenções necessárias.</p>
        </div>
        <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#94a3b8;">
          Enviado automaticamente pelo sistema de gestão de frota JNG
        </div>
      </div>
    `;

    // Send to all managers
    const results = [];
    for (const manager of managers) {
      const { error } = await resend.emails.send({
        from: "Frota JNG <onboarding@resend.dev>",
        to: [manager.email],
        subject: `⚠️ Alerta: ${critical.length} veículo(s) precisam de troca de óleo`,
        html,
      });
      results.push({ email: manager.email, error: error?.message || null });
    }

    return new Response(
      JSON.stringify({ sent: results.length, critical: critical.length, results }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Oil change alert error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
