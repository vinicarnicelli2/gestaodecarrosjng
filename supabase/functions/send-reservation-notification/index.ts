import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReservationPayload {
  managerEmail: string;
  managerName: string;
  requesterName: string;
  vehiclePlate: string;
  vehicleModel: string;
  startDate: string;
  endDate: string;
  reason: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      managerEmail,
      managerName,
      requesterName,
      vehiclePlate,
      vehicleModel,
      startDate,
      endDate,
      reason,
    }: ReservationPayload = await req.json();

    const start = new Date(startDate).toLocaleDateString("pt-BR");
    const end = new Date(endDate).toLocaleDateString("pt-BR");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:#0046a0;color:#ffffff;padding:24px;text-align:center;">
          <h1 style="margin:0;font-size:22px;">Nova Solicitação de Reserva</h1>
        </div>
        
        <div style="padding:24px;">
          <p style="color:#333;font-size:15px;">Olá <strong>${managerName}</strong>,</p>
          <p style="color:#555;font-size:14px;">O colaborador <strong>${requesterName}</strong> solicitou a reserva de um veículo:</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr>
              <td style="padding:10px;font-weight:bold;color:#64748b;border-bottom:1px solid #e5e7eb;">Veículo:</td>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${vehiclePlate} — ${vehicleModel}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:bold;color:#64748b;border-bottom:1px solid #e5e7eb;">Período:</td>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${start} → ${end}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:bold;color:#64748b;border-bottom:1px solid #e5e7eb;">Motivo:</td>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${reason}</td>
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
      from: "Frota JNG <rh@jng.com.br>",
      to: [managerEmail],
      subject: `Nova Reserva — ${requesterName} solicita ${vehiclePlate}`,
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
