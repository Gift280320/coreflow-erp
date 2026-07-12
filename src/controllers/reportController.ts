import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

// ---------- EXCEL HELPERS ----------
function sendExcel(res: Response, data: any[], filename: string, sheetName: string = 'Sheet1') {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  // Auto column widths (rough estimate)
  const cols = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2
  }));
  ws['!cols'] = cols;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
  res.send(buffer);
}

// ---------- INVOICE PDF ----------
export const exportInvoicePDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, items: { include: { product: true } } },
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${invoice.issueDate.toLocaleDateString()}`);
    doc.text(`Due: ${invoice.dueDate.toLocaleDateString()}`);
    doc.moveDown();

    // Customer
    doc.text(`Customer: ${invoice.customer?.name || 'N/A'}`);
    if (invoice.customer?.email) doc.text(`Email: ${invoice.customer.email}`);
    if (invoice.customer?.phone) doc.text(`Phone: ${invoice.customer.phone}`);
    doc.moveDown();

    // Items table
    const tableTop = doc.y;
    doc.fontSize(12).text('Item', 50, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Price', 370, tableTop);
    doc.text('Total', 440, tableTop);
    doc.moveDown();
    let yPos = doc.y;
    invoice.items.forEach((item: any) => {
      doc.text(item.description || item.product?.name || 'Item', 50, yPos);
      doc.text(String(item.quantity), 300, yPos);
      doc.text(`$${item.unitPrice.toFixed(2)}`, 370, yPos);
      doc.text(`$${item.total.toFixed(2)}`, 440, yPos);
      yPos += 20;
      if (yPos > 700) { doc.addPage(); yPos = 50; }
    });
    doc.moveDown();
    const subtotalY = doc.y;
    doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`Tax (${invoice.taxRate || 0}%): $${invoice.taxAmount.toFixed(2)}`, { align: 'right' });
    doc.fontSize(16).text(`Total: $${invoice.total.toFixed(2)}`, { align: 'right' });
    if (invoice.notes) {
      doc.moveDown();
      doc.fontSize(10).text(`Notes: ${invoice.notes}`);
    }

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate invoice PDF' });
  }
};

// ---------- EXCEL REPORTS (with formatting) ----------
export const exportInvoicesExcel = async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
    const data = invoices.map(inv => ({
      'Invoice #': inv.invoiceNumber,
      'Customer': inv.customer?.name || '',
      'Issue Date': inv.issueDate.toLocaleDateString(),
      'Due Date': inv.dueDate.toLocaleDateString(),
      'Subtotal': parseFloat(inv.subtotal.toFixed(2)),
      'Tax': parseFloat(inv.taxAmount.toFixed(2)),
      'Total': parseFloat(inv.total.toFixed(2)),
      'Status': inv.status,
    }));
    sendExcel(res, data, 'invoices');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export invoices' });
  }
};

export const exportPurchaseOrdersExcel = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
    });
    const data = orders.map(order => ({
      'Order #': order.orderNumber,
      'Supplier': order.supplier?.name || '',
      'Order Date': order.orderDate.toLocaleDateString(),
      'Total Amount': parseFloat(order.totalAmount.toFixed(2)),
      'Status': order.status,
    }));
    sendExcel(res, data, 'purchase_orders');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export purchase orders' });
  }
};

export const exportStockExcel = async (req: Request, res: Response) => {
  try {
    const stock = await prisma.stockItem.findMany({
      include: { product: true, warehouse: true },
      orderBy: { product: { name: 'asc' } },
    });
    const data = stock.map(item => ({
      'Product': item.product?.name || '',
      'SKU': item.product?.sku || '',
      'Warehouse': item.warehouse?.name || '',
      'Quantity': item.quantity,
    }));
    sendExcel(res, data, 'stock');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export stock' });
  }
};

export const exportExpensesExcel = async (req: Request, res: Response) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: { account: true },
      orderBy: { date: 'desc' },
    });
    const data = expenses.map(exp => ({
      'Date': exp.date.toLocaleDateString(),
      'Description': exp.description,
      'Account': exp.account?.name || '',
      'Amount': parseFloat(exp.amount.toFixed(2)),
      'Reference': exp.reference || '',
    }));
    sendExcel(res, data, 'expenses');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export expenses' });
  }
};

export const exportAssetsExcel = async (req: Request, res: Response) => {
  try {
    const assets = await prisma.asset.findMany({
      include: { employee: { include: { user: true } } },
      orderBy: { name: 'asc' },
    });
    const data = assets.map(asset => ({
      'Name': asset.name,
      'Serial #': asset.serialNumber || '',
      'Category': asset.category || '',
      'Status': asset.status,
      'Cost': parseFloat((asset.cost || 0).toFixed(2)),
      'Current Value': parseFloat((asset.currentValue || 0).toFixed(2)),
      'Assigned To': asset.employee?.user?.firstName + ' ' + asset.employee?.user?.lastName || '',
      'Location': asset.location || '',
    }));
    sendExcel(res, data, 'assets');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to export assets' });
  }
};
