import jsPDF from "jspdf";

interface ChecklistPdfData {
  vehiclePlate: string;
  vehicleModel: string;
  driverName: string;
  km: string;
  checklistType: string;
  checks: Record<string, string>;
  checklistItems: { id: string; label: string }[];
  observations: string;
  signatureDataUrl: string | null;
  date: string;
}

export function generateChecklistPdf(data: ChecklistPdfData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const addLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
  };

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Checklist Veicular", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const typeBadge = data.checklistType === "Retirada" ? "RETIRADA" : "DEVOLUÇÃO";
  doc.text(`Tipo: ${typeBadge}`, pageWidth / 2, y, { align: "center" });
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Data: ${data.date}`, pageWidth / 2, y, { align: "center" });
  doc.setTextColor(0, 0, 0);
  y += 8;

  addLine();

  // Vehicle & Driver info
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Informações", margin, y);
  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const infoRows = [
    ["Veículo:", `${data.vehiclePlate} — ${data.vehicleModel}`],
    ["Operador:", data.driverName],
    ["KM Atual:", `${data.km} km`],
  ];
  infoRows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 28, y);
    y += 6;
  });
  y += 4;
  addLine();

  // Checklist items
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Itens de Inspeção", margin, y);
  y += 7;

  doc.setFontSize(9);
  data.checklistItems.forEach((item) => {
    const status = data.checks[item.id];
    const statusText = status === "ok" ? "OK" : status === "problema" ? "PROBLEMA" : "—";

    // Check if we need a new page
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "normal");
    doc.text(item.label, margin + 2, y);

    if (status === "problema") {
      doc.setTextColor(220, 38, 38);
      doc.setFont("helvetica", "bold");
    } else if (status === "ok") {
      doc.setTextColor(22, 163, 74);
      doc.setFont("helvetica", "bold");
    }
    doc.text(statusText, pageWidth - margin, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 5.5;
  });

  const problemCount = Object.values(data.checks).filter((v) => v === "problema").length;
  if (problemCount > 0) {
    y += 2;
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`⚠ ${problemCount} problema(s) identificado(s)`, margin, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    y += 6;
  }

  y += 4;
  addLine();

  // Observations
  if (data.observations.trim()) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Observações", margin, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(data.observations, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 6;
    addLine();
  }

  // Terms
  if (y > 220) { doc.addPage(); y = 20; }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Termo de Responsabilidade", margin, y);
  y += 7;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const termsText = [
    "Ao assinar este termo, declaro que recebi o veículo nas condições descritas acima e estou ciente de que:",
    "",
    "• Quaisquer danos causados ao veículo durante o período de utilização serão de minha inteira responsabilidade.",
    "• Os custos de reparo dos danos identificados na devolução, que não constavam na retirada, serão descontados conforme política da empresa.",
    "• Comprometo-me a utilizar o veículo de forma adequada, respeitando as leis de trânsito e normas internas.",
    "• Multas de trânsito ocorridas durante o período de uso são de minha responsabilidade.",
  ];

  termsText.forEach((line) => {
    if (line === "") { y += 2; return; }
    const wrapped = doc.splitTextToSize(line, contentWidth);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 3.8;
  });

  y += 8;

  // Signature
  if (data.signatureDataUrl) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Assinatura:", margin, y);
    y += 4;

    try {
      doc.addImage(data.signatureDataUrl, "PNG", margin, y, 60, 24);
      y += 26;
    } catch {
      doc.text("[Assinatura digital anexada]", margin, y);
      y += 6;
    }

    doc.setDrawColor(0, 0, 0);
    doc.line(margin, y, margin + 70, y);
    y += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(data.driverName, margin, y);
    y += 4;
    doc.text(data.date, margin, y);
  }

  // Save
  const fileName = `checklist_${data.checklistType.toLowerCase()}_${data.vehiclePlate.replace(/\s/g, "")}_${data.date.replace(/\//g, "-")}.pdf`;
  doc.save(fileName);
}
