export interface Client {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  clientId: string;
  numberOfVideos: number;
  chargePerVideo: number;
  total: number;
  createdAt: Date;
}

export interface Payment {
  id: string;
  clientId: string;
  amount: number;
  date: Date;
  notes?: string;
}

export interface ClientSummary {
  client: Client;
  totalProjects: number;
  totalEarned: number;
  totalPaid: number;
  outstandingBalance: number;
}