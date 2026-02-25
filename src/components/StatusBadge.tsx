interface StatusBadgeProps {
  status: string;
}

const statusMap: Record<string, { bg: string; text: string }> = {
  "disponível": { bg: "bg-success/15 border-success/30", text: "text-success" },
  "em uso": { bg: "bg-accent/15 border-accent/30", text: "text-accent" },
  "manutenção": { bg: "bg-destructive/15 border-destructive/30", text: "text-destructive" },
  "ativo": { bg: "bg-success/15 border-success/30", text: "text-success" },
  "inativo": { bg: "bg-muted border-border", text: "text-muted-foreground" },
  "cnh vencida": { bg: "bg-destructive/15 border-destructive/30", text: "text-destructive" },
  "agendada": { bg: "bg-accent/15 border-accent/30", text: "text-accent" },
  "em andamento": { bg: "bg-warning/15 border-warning/30", text: "text-warning" },
  "concluída": { bg: "bg-success/15 border-success/30", text: "text-success" },
  "pendente": { bg: "bg-warning/15 border-warning/30", text: "text-warning" },
  "aprovada": { bg: "bg-success/15 border-success/30", text: "text-success" },
  "rejeitada": { bg: "bg-destructive/15 border-destructive/30", text: "text-destructive" },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const style = statusMap[status] || { bg: "bg-muted", text: "text-muted-foreground" };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${style.bg} ${style.text}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
