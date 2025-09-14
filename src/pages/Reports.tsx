import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Client, Project, Payment, ClientSummary } from '@/types';
import { getClients, getProjects, getPayments } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Reports = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [clientData, projectData, paymentData] = await Promise.all([
        getClients(),
        getProjects(),
        getPayments()
      ]);
      
      setClients(clientData);
      setProjects(projectData);
      setPayments(paymentData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getClientSummaries = (): ClientSummary[] => {
    return clients.map(client => {
      const clientProjects = projects.filter(p => p.clientId === client.id);
      const clientPayments = payments.filter(p => p.clientId === client.id);
      
      const totalEarned = clientProjects.reduce((sum, project) => sum + project.total, 0);
      const totalPaid = clientPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        client,
        totalProjects: clientProjects.length,
        totalEarned,
        totalPaid,
        outstandingBalance: totalEarned - totalPaid
      };
    });
  };

  const getPaymentsByDate = (date: string) => {
    const targetDate = new Date(date);
    return payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate.toDateString() === targetDate.toDateString();
    });
  };

  const exportClientReport = (clientSummary: ClientSummary) => {
    const clientProjects = projects.filter(p => p.clientId === clientSummary.client.id);
    const clientPayments = payments.filter(p => p.clientId === clientSummary.client.id);

    const workbook = XLSX.utils.book_new();

    // Client Summary Sheet
    const summaryData = [
      ['Client Report'],
      [''],
      ['Client Name', clientSummary.client.name],
      ['Client Since', new Date(clientSummary.client.createdAt).toLocaleDateString()],
      [''],
      ['Summary'],
      ['Total Projects', clientSummary.totalProjects],
      ['Total Earned', `$${clientSummary.totalEarned.toFixed(2)}`],
      ['Total Paid', `$${clientSummary.totalPaid.toFixed(2)}`],
      ['Outstanding Balance', `$${clientSummary.outstandingBalance.toFixed(2)}`],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Projects Sheet
    const projectData = [
      ['Date', 'Number of Videos', 'Charge per Video', 'Total'],
      ...clientProjects.map(project => [
        new Date(project.createdAt).toLocaleDateString(),
        project.numberOfVideos,
        project.chargePerVideo,
        project.total
      ])
    ];

    const projectSheet = XLSX.utils.aoa_to_sheet(projectData);
    XLSX.utils.book_append_sheet(workbook, projectSheet, 'Projects');

    // Payments Sheet
    const paymentData = [
      ['Date', 'Amount', 'Notes'],
      ...clientPayments.map(payment => [
        new Date(payment.date).toLocaleDateString(),
        payment.amount,
        payment.notes || ''
      ])
    ];

    const paymentSheet = XLSX.utils.aoa_to_sheet(paymentData);
    XLSX.utils.book_append_sheet(workbook, paymentSheet, 'Payments');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${clientSummary.client.name}_report.xlsx`);

    toast({
      title: "Success",
      description: `Client report for ${clientSummary.client.name} exported successfully`,
    });
  };

  const exportDailyReport = () => {
    const dailyPayments = getPaymentsByDate(selectedDate);
    
    if (dailyPayments.length === 0) {
      toast({
        title: "No Data",
        description: "No payments found for the selected date",
        variant: "destructive"
      });
      return;
    }

    const workbook = XLSX.utils.book_new();
    
    const reportData = [
      ['Daily Payment Report'],
      ['Date', new Date(selectedDate).toLocaleDateString()],
      [''],
      ['Client', 'Amount', 'Notes'],
      ...dailyPayments.map(payment => {
        const client = clients.find(c => c.id === payment.clientId);
        return [
          client?.name || 'Unknown Client',
          payment.amount,
          payment.notes || ''
        ];
      }),
      [''],
      ['Total Payments', dailyPayments.reduce((sum, p) => sum + p.amount, 0)]
    ];

    const sheet = XLSX.utils.aoa_to_sheet(reportData);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Daily Report');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `daily_report_${selectedDate}.xlsx`);

    toast({
      title: "Success",
      description: "Daily report exported successfully",
    });
  };

  const clientSummaries = getClientSummaries();
  const dailyPayments = getPaymentsByDate(selectedDate);
  const dailyTotal = dailyPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Export client and payment reports
        </p>
      </div>

      {/* Client-wise Reports */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client-wise Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientSummaries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Total Earned</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientSummaries.map((summary) => (
                  <TableRow key={summary.client.id}>
                    <TableCell className="font-medium">{summary.client.name}</TableCell>
                    <TableCell>{summary.totalProjects}</TableCell>
                    <TableCell>${summary.totalEarned.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600">
                        ${summary.totalPaid.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={summary.outstandingBalance > 0 ? "destructive" : "secondary"}>
                        ${summary.outstandingBalance.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => exportClientReport(summary)}
                        className="bg-gradient-primary hover:shadow-glow transition-smooth"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No client data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Reports */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Payment Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="reportDate">Select Date</Label>
              <Input
                id="reportDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <Button
              onClick={exportDailyReport}
              disabled={dailyPayments.length === 0}
              className="bg-gradient-primary hover:shadow-glow transition-smooth"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Daily Report
            </Button>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Payments on {new Date(selectedDate).toLocaleDateString()}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {dailyPayments.length} payment{dailyPayments.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">${dailyTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {dailyPayments.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyPayments.map((payment) => {
                  const client = clients.find(c => c.id === payment.clientId);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{client?.name || 'Unknown Client'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          ${payment.amount.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.notes || '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;