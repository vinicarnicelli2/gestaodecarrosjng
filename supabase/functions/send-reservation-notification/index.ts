import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReservationPayload {
  vehiclePlate?: string;
  vehicleModel?: string;
  startDate: string;
  endDate: string;
  reason: string;
}

const esc = (s: unknown): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const truncate = (s: unknown, n: number) => String(s ?? "").slice(0, n);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    const user = userData.user;

    const body: ReservationPayload = await req.json();
    const { vehiclePlate, vehicleModel, startDate, endDate, reason } = body;

    // 2. Basic input validation
    if (!startDate || !endDate || !reason) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 3. Derive manager server-side from authenticated user
    const { data: link } = await supabaseAdmin
      .from("collaborator_manager")
      .select("manager_id")
      .eq("collaborator_user_id", user.id)
      .maybeSingle();

    if (!link?.manager_id) {
      return new Response(JSON.stringify({ error: "No manager linked to this user" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: manager } = await supabaseAdmin
      .from("managers")
      .select("name, email")
      .eq("id", link.manager_id)
      .single();

    if (!manager?.email) {
      return new Response(JSON.stringify({ error: "Manager not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 4. Derive requester name server-side
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();
    const requesterName = profile?.display_name || user.email || "Colaborador";

    const start = new Date(startDate).toLocaleDateString("pt-BR");
    const end = new Date(endDate).toLocaleDateString("pt-BR");

    // 5. Escape all dynamic values + apply length limits
    const safe = {
      managerName: esc(truncate(manager.name, 200)),
      requesterName: esc(truncate(requesterName, 200)),
      vehiclePlate: esc(truncate(vehiclePlate, 20)),
      vehicleModel: esc(truncate(vehicleModel, 100)),
      reason: esc(truncate(reason, 2000)),
      start: esc(start),
      end: esc(end),
    };

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:#0046a0;color:#ffffff;padding:24px;text-align:center;">
          <h1 style="margin:0;font-size:22px;">Nova Solicitação de Reserva</h1>
        </div>
        
        <div style="padding:24px;">
          <p style="color:#333;font-size:15px;">Olá <strong>${safe.managerName}</strong>,</p>
          <p style="color:#555;font-size:14px;">O colaborador <strong>${safe.requesterName}</strong> solicitou a reserva de um veículo:</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr>
              <td style="padding:10px;font-weight:bold;color:#64748b;border-bottom:1px solid #e5e7eb;">Veículo:</td>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${safe.vehiclePlate} — ${safe.vehicleModel}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:bold;color:#64748b;border-bottom:1px solid #e5e7eb;">Período:</td>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${safe.start} → ${safe.end}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:bold;color:#64748b;border-bottom:1px solid #e5e7eb;">Motivo:</td>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${safe.reason}</td>
            </tr>
          </table>

          <p style="color:#555;font-size:14px;">Acesse o sistema para aprovar ou rejeitar esta solicitação.</p>
        </div>

        <div style="background:#f1f5f9;padding:16px;text-align:center;font-size:12px;color:#94a3b8;">
          Enviado automaticamente pelo sistema de gestão de frota JNG
        </div>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: "Frota JNG <frotas@jng.com.br>",
      to: [manager.email],
      subject: `Nova Reserva — ${requesterName} solicita ${vehiclePlate ?? ""}`.slice(0, 200),
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
    console.error("Error sending reservation notification:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
