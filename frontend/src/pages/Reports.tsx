import { useState } from 'react';
import axios from '../lib/axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';

export default function Reports() {
  const [loading, setLoading] = useState<string | null>(null);

  const downloadReport = async (endpoint: string, filename: string) => {
    setLoading(endpoint);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/reports/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download report');
    } finally {
      setLoading(null);
    }
  };

  const reports = [
    { key: 'invoices/excel', label: 'Invoices', icon: FileSpreadsheet },
    { key: 'purchase-orders/excel', label: 'Purchase Orders', icon: FileSpreadsheet },
    { key: 'stock/excel', label: 'Stock', icon: FileSpreadsheet },
    { key: 'expenses/excel', label: 'Expenses', icon: FileSpreadsheet },
    { key: 'assets/excel', label: 'Assets', icon: FileSpreadsheet },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <report.icon className="w-5 h-5" />
                {report.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => downloadReport(report.key, report.label.toLowerCase().replace(/ /g, '_'))}
                disabled={loading === report.key}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {loading === report.key ? 'Downloading...' : 'Download Excel'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
