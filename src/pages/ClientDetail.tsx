import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, DollarSign, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Client, Project, Payment } from '@/types';
import { getClients, getProjectsByClient, getPaymentsByClient, deleteProject, deletePayment } from '@/lib/storage';
import { AddProjectDialog } from '@/components/projects/AddProjectDialog';
import { AddPaymentDialog } from '@/components/payments/AddPaymentDialog';
import { useToast } from '@/hooks/use-toast';

const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  const loadData = async () => {
    if (!clientId) return;
    
    try {
      const clients = await getClients();
      const foundClient = clients.find(c => c.id === clientId);
      setClient(foundClient || null);
      
      const clientProjects = await getProjectsByClient(clientId);
      setProjects(clientProjects);
      
      const clientPayments = await getPaymentsByClient(clientId);
      setPayments(clientPayments);
    } catch (error) {
      console.error('Error loading client data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      await loadData();
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deletePayment(paymentId);
      await loadData();
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive"
      });
    }
  };

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold mb-4">Client not found</h2>
        <Button onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  const totalEarned = projects.reduce((sum, project) => sum + project.total, 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstandingBalance = totalEarned - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {client.name}
            </h1>
            <p className="text-muted-foreground">
              Client since {new Date(client.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">${totalEarned.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">${totalPaid.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">${outstandingBalance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Projects</h2>
            <Button 
              onClick={() => setShowAddProject(true)}
              className="bg-gradient-primary hover:shadow-glow transition-smooth"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>

          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="p-0">
              {projects.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Videos</TableHead>
                      <TableHead>Rate per Video</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          {new Date(project.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{project.numberOfVideos}</TableCell>
                        <TableCell>${project.chargePerVideo.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            ${project.total.toFixed(2)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-4">Add the first project for this client</p>
                  <Button 
                    onClick={() => setShowAddProject(true)}
                    className="bg-gradient-primary hover:shadow-glow transition-smooth"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Payment History</h2>
            <Button 
              onClick={() => setShowAddPayment(true)}
              className="bg-gradient-primary hover:shadow-glow transition-smooth"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>

          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="p-0">
              {payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600">
                            ${payment.amount.toFixed(2)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {payment.notes || '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
                  <p className="text-muted-foreground mb-4">Record the first payment from this client</p>
                  <Button 
                    onClick={() => setShowAddPayment(true)}
                    className="bg-gradient-primary hover:shadow-glow transition-smooth"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Payment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddProjectDialog
        open={showAddProject}
        onOpenChange={setShowAddProject}
        clientId={clientId!}
        onProjectAdded={loadData}
      />

      <AddPaymentDialog
        open={showAddPayment}
        onOpenChange={setShowAddPayment}
        clientId={clientId!}
        onPaymentAdded={loadData}
      />
    </div>
  );
};

export default ClientDetail;