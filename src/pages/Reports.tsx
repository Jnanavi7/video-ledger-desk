import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          View client reports, payments, and business insights
        </p>
      </div>

      {/* Coming Soon */}
      <Card className="bg-gradient-card shadow-soft">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 bg-primary/10 rounded-full mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Reports Coming Soon
          </h3>
          <p className="text-muted-foreground text-center">
            Comprehensive reporting features are being developed. You'll be able to view client summaries, payment history, and export data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;