import { useState, useEffect } from 'react';
import { ClientList } from '@/components/clients/ClientList';
import { getClients } from '@/lib/storage';
import { Client } from '@/types';

const Index = () => {
  const [clients, setClients] = useState<Client[]>([]);

  const loadClients = async () => {
    const clientData = await getClients();
    setClients(clientData);
  };

  useEffect(() => {
    loadClients();
  }, []);

  return <ClientList clients={clients} onClientAdded={loadClients} />;
};

export default Index;
