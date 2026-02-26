import { Car, Users, Wrench, CalendarCheck, Droplets, LayoutDashboard, ClipboardCheck, History } from "lucide-react";

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  year: number;
  km: number;
  status: "disponível" | "em uso" | "manutenção";
  nextOilChange: number;
  lastOilChange: string;
}

export interface Driver {
  id: string;
  name: string;
  cnh: string;
  cnhExpiry: string;
  cnhCategory: string;
  phone: string;
  status: "ativo" | "inativo" | "cnh vencida";
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  type: string;
  description: string;
  date: string;
  cost: number;
  status: "agendada" | "em andamento" | "concluída";
}

export interface Reservation {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverId: string;
  driverName: string;
  startDate: string;
  endDate: string;
  purpose: string;
  status: "pendente" | "aprovada" | "rejeitada";
}

export const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Checklist", icon: ClipboardCheck, path: "/checklist" },
  { label: "Histórico", icon: History, path: "/checklist/historico" },
  { label: "Veículos", icon: Car, path: "/veiculos" },
  { label: "Motoristas", icon: Users, path: "/motoristas" },
  { label: "Manutenções", icon: Wrench, path: "/manutencoes" },
  { label: "Controle de Óleo", icon: Droplets, path: "/oleo" },
  { label: "Reservas", icon: CalendarCheck, path: "/reservas" },
];

export const mockVehicles: Vehicle[] = [
  { id: "1", plate: "ABC-1D23", model: "Fiat Strada", year: 2023, km: 45200, status: "disponível", nextOilChange: 50000, lastOilChange: "2024-11-15" },
  { id: "2", plate: "DEF-4E56", model: "VW Saveiro", year: 2022, km: 62100, status: "em uso", nextOilChange: 65000, lastOilChange: "2024-10-20" },
  { id: "3", plate: "GHI-7F89", model: "Toyota Hilux", year: 2024, km: 12300, status: "disponível", nextOilChange: 15000, lastOilChange: "2025-01-10" },
  { id: "4", plate: "JKL-0G12", model: "Chevrolet S10", year: 2021, km: 89500, status: "manutenção", nextOilChange: 90000, lastOilChange: "2024-12-05" },
  { id: "5", plate: "MNO-3H45", model: "Renault Duster", year: 2023, km: 33400, status: "disponível", nextOilChange: 35000, lastOilChange: "2025-02-01" },
];

export const mockDrivers: Driver[] = [
  { id: "1", name: "Carlos Silva", cnh: "04512345678", cnhExpiry: "2026-08-15", cnhCategory: "B", phone: "(11) 98765-4321", status: "ativo" },
  { id: "2", name: "Ana Oliveira", cnh: "07898765432", cnhExpiry: "2025-03-10", cnhCategory: "AB", phone: "(11) 91234-5678", status: "cnh vencida" },
  { id: "3", name: "João Santos", cnh: "05634567890", cnhExpiry: "2027-12-01", cnhCategory: "D", phone: "(11) 99876-5432", status: "ativo" },
  { id: "4", name: "Maria Costa", cnh: "06745678901", cnhExpiry: "2026-05-20", cnhCategory: "B", phone: "(11) 92345-6789", status: "ativo" },
];

export const mockMaintenances: Maintenance[] = [
  { id: "1", vehicleId: "4", vehiclePlate: "JKL-0G12", type: "Freios", description: "Troca de pastilhas dianteiras", date: "2025-02-20", cost: 450, status: "em andamento" },
  { id: "2", vehicleId: "1", vehiclePlate: "ABC-1D23", type: "Revisão", description: "Revisão geral 50.000km", date: "2025-03-15", cost: 1200, status: "agendada" },
  { id: "3", vehicleId: "2", vehiclePlate: "DEF-4E56", type: "Pneus", description: "Troca de pneus traseiros", date: "2025-01-28", cost: 800, status: "concluída" },
  { id: "4", vehicleId: "3", vehiclePlate: "GHI-7F89", type: "Elétrica", description: "Reparo no alternador", date: "2025-03-01", cost: 650, status: "agendada" },
];

export const mockReservations: Reservation[] = [
  { id: "1", vehicleId: "1", vehiclePlate: "ABC-1D23", vehicleModel: "Fiat Strada", driverId: "1", driverName: "Carlos Silva", startDate: "2025-02-28", endDate: "2025-03-02", purpose: "Entrega de materiais - Obra Centro", status: "pendente" },
  { id: "2", vehicleId: "3", vehiclePlate: "GHI-7F89", vehicleModel: "Toyota Hilux", driverId: "3", driverName: "João Santos", startDate: "2025-03-05", endDate: "2025-03-07", purpose: "Visita técnica - Filial SP", status: "pendente" },
  { id: "3", vehicleId: "5", vehiclePlate: "MNO-3H45", vehicleModel: "Renault Duster", driverId: "4", driverName: "Maria Costa", startDate: "2025-02-25", endDate: "2025-02-26", purpose: "Reunião com cliente", status: "aprovada" },
  { id: "4", vehicleId: "2", vehiclePlate: "DEF-4E56", vehicleModel: "VW Saveiro", driverId: "1", driverName: "Carlos Silva", startDate: "2025-02-20", endDate: "2025-02-21", purpose: "Transporte de equipamentos", status: "rejeitada" },
];
