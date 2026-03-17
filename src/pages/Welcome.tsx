import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  ClipboardCheck,
  CalendarCheck,
  History,
  Car,
  Wrench,
  Droplets,
  ArrowRight,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoJng from "@/assets/logo-jng.png";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Checklist de Veículos",
    description:
      "Antes de usar um veículo, preencha o checklist de retirada. Ao devolver, faça o checklist de devolução. Registre avarias com fotos e assine digitalmente.",
    forAll: true,
  },
  {
    icon: CalendarCheck,
    title: "Solicitar Reservas",
    description:
      "Reserve um veículo informando o período e motivo. Seu gestor será notificado e poderá aprovar ou rejeitar a solicitação.",
    forAll: true,
  },
  {
    icon: History,
    title: "Histórico de Checklists",
    description:
      "Consulte todos os seus checklists anteriores, verifique problemas relatados e acompanhe o histórico completo de inspeções.",
    forAll: true,
  },
  {
    icon: Car,
    title: "Gestão da Frota",
    description:
      "Administradores gerenciam veículos, motoristas, manutenções e controlam trocas de óleo no painel completo.",
    forAll: false,
  },
];

const tips = [
  "Preencha sempre o KM atual do veículo com precisão",
  "Tire fotos claras de qualquer avaria encontrada",
  "Solicite reservas com antecedência para garantir disponibilidade",
  "Em caso de dúvida, procure o administrador do sistema",
];

const Welcome = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const handleStart = () => {
    localStorage.setItem("jng_onboarding_done", "true");
    navigate(isAdmin ? "/" : "/checklist");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-10 px-6 text-center">
        <img src={logoJng} alt="JNG" className="h-12 mx-auto mb-4" />
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
          Bem-vindo ao Gestão de Frota
        </h1>
        <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
          Conheça as principais funcionalidades do sistema antes de começar
        </p>
      </header>

      {/* Steps */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {steps
            .filter((s) => s.forAll || isAdmin)
            .map((step, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-6 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                  <step.icon className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-base mb-1">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
        </div>

        {/* Tips */}
        <div className="mt-10 bg-accent/10 border border-accent/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-accent" size={20} />
            <h2 className="font-semibold text-foreground text-lg">
              Dicas Importantes
            </h2>
          </div>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2
                  className="text-success shrink-0 mt-0.5"
                  size={16}
                />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Button
            size="lg"
            onClick={handleStart}
            className="gap-2 text-base px-8"
          >
            Começar a usar
            <ArrowRight size={18} />
          </Button>
          <p className="text-muted-foreground text-xs mt-3">
            Você pode acessar este tutorial novamente pelo menu de ajuda
          </p>
        </div>
      </main>
    </div>
  );
};

export default Welcome;
