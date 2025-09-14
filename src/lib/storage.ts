// Local storage utilities for offline data persistence
// This will be perfect for Tauri's filesystem/SQLite integration later

import { Client, Project, Payment } from '@/types';

const STORAGE_KEYS = {
  clients: 'video_editor_clients',
  projects: 'video_editor_projects',
  payments: 'video_editor_payments'
} as const;

// Client storage
export const getClients = (): Client[] => {
  const data = localStorage.getItem(STORAGE_KEYS.clients);
  return data ? JSON.parse(data) : [];
};

export const saveClient = (client: Client): void => {
  const clients = getClients();
  const existingIndex = clients.findIndex(c => c.id === client.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = client;
  } else {
    clients.push(client);
  }
  
  localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
};

export const deleteClient = (clientId: string): void => {
  const clients = getClients().filter(c => c.id !== clientId);
  localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
  
  // Also remove related projects and payments
  const projects = getProjects().filter(p => p.clientId !== clientId);
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
  
  const payments = getPayments().filter(p => p.clientId !== clientId);
  localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
};

// Project storage
export const getProjects = (): Project[] => {
  const data = localStorage.getItem(STORAGE_KEYS.projects);
  return data ? JSON.parse(data) : [];
};

export const getProjectsByClient = (clientId: string): Project[] => {
  return getProjects().filter(p => p.clientId === clientId);
};

export const saveProject = (project: Project): void => {
  const projects = getProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  
  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
};

export const deleteProject = (projectId: string): void => {
  const projects = getProjects().filter(p => p.id !== projectId);
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
};

// Payment storage
export const getPayments = (): Payment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.payments);
  return data ? JSON.parse(data) : [];
};

export const getPaymentsByClient = (clientId: string): Payment[] => {
  return getPayments().filter(p => p.clientId === clientId);
};

export const savePayment = (payment: Payment): void => {
  const payments = getPayments();
  const existingIndex = payments.findIndex(p => p.id === payment.id);
  
  if (existingIndex >= 0) {
    payments[existingIndex] = payment;
  } else {
    payments.push(payment);
  }
  
  localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
};

export const deletePayment = (paymentId: string): void => {
  const payments = getPayments().filter(p => p.id !== paymentId);
  localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};