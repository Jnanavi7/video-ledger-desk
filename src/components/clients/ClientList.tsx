import { useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Client } from '@/types';

import { AddClientDialog } from './AddClientDialog';
import { useNavigate } from 'react-router-dom';

interface ClientListProps {
  clients: Client[];
  onClientAdded: () => void;
}

export function ClientList({ clients, onClientAdded }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const navigate = useNavigate();

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Client Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your video editing clients and projects
          </p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-primary hover:shadow-glow transition-smooth"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-gradient-card shadow-soft">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Card 
              key={client.id} 
              className="group bg-gradient-card shadow-soft hover:shadow-medium transition-smooth cursor-pointer border-0"
              onClick={() => navigate(`/client/${client.id}`)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-smooth">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-smooth">
                      {client.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Added {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 bg-muted/50 rounded-full mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start by adding your first client to manage their projects and payments'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-primary hover:shadow-glow transition-smooth"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Client
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Client Dialog */}
      <AddClientDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onClientAdded={onClientAdded}
      />
    </div>
  );
}