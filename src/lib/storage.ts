// Tauri storage utilities for offline data persistence
import { Store } from '@tauri-apps/plugin-store';
import { Client, Project, Payment } from '@/types';

let store: Store;

const initStore = async () => {
  if (!store) {
    store = await Store.load('app-data.json');
  }
  return store;
};

const STORAGE_KEYS = {
  clients: 'video_editor_clients',
  projects: 'video_editor_projects',
  payments: 'video_editor_payments'
} as const;

// Client storage
export const getClients = async (): Promise<Client[]> => {
  const storeInstance = await initStore();
  const data = await storeInstance.get(STORAGE_KEYS.clients);
  return data ? (data as Client[]) : [];
};

export const saveClient = async (client: Client): Promise<void> => {
  const storeInstance = await initStore();
  const clients = await getClients();
  const existingIndex = clients.findIndex(c => c.id === client.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = client;
  } else {
    clients.push(client);
  }
  
  await storeInstance.set(STORAGE_KEYS.clients, clients);
  await storeInstance.save();
};

export const deleteClient = async (clientId: string): Promise<void> => {
  const storeInstance = await initStore();
  const clients = (await getClients()).filter(c => c.id !== clientId);
  await storeInstance.set(STORAGE_KEYS.clients, clients);
  
  // Also remove related projects and payments
  const projects = (await getProjects()).filter(p => p.clientId !== clientId);
  await storeInstance.set(STORAGE_KEYS.projects, projects);
  
  const payments = (await getPayments()).filter(p => p.clientId !== clientId);
  await storeInstance.set(STORAGE_KEYS.payments, payments);
  
  await storeInstance.save();
};

// Project storage
export const getProjects = async (): Promise<Project[]> => {
  const storeInstance = await initStore();
  const data = await storeInstance.get(STORAGE_KEYS.projects);
  return data ? (data as Project[]) : [];
};

export const getProjectsByClient = async (clientId: string): Promise<Project[]> => {
  const projects = await getProjects();
  return projects.filter(p => p.clientId === clientId);
};

export const saveProject = async (project: Project): Promise<void> => {
  const storeInstance = await initStore();
  const projects = await getProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  
  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  
  await storeInstance.set(STORAGE_KEYS.projects, projects);
  await storeInstance.save();
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const storeInstance = await initStore();
  const projects = (await getProjects()).filter(p => p.id !== projectId);
  await storeInstance.set(STORAGE_KEYS.projects, projects);
  await storeInstance.save();
};

// Payment storage
export const getPayments = async (): Promise<Payment[]> => {
  const storeInstance = await initStore();
  const data = await storeInstance.get(STORAGE_KEYS.payments);
  return data ? (data as Payment[]) : [];
};

export const getPaymentsByClient = async (clientId: string): Promise<Payment[]> => {
  const payments = await getPayments();
  return payments.filter(p => p.clientId === clientId);
};

export const savePayment = async (payment: Payment): Promise<void> => {
  const storeInstance = await initStore();
  const payments = await getPayments();
  const existingIndex = payments.findIndex(p => p.id === payment.id);
  
  if (existingIndex >= 0) {
    payments[existingIndex] = payment;
  } else {
    payments.push(payment);
  }
  
  await storeInstance.set(STORAGE_KEYS.payments, payments);
  await storeInstance.save();
};

export const deletePayment = async (paymentId: string): Promise<void> => {
  const storeInstance = await initStore();
  const payments = (await getPayments()).filter(p => p.id !== paymentId);
  await storeInstance.set(STORAGE_KEYS.payments, payments);
  await storeInstance.save();
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};