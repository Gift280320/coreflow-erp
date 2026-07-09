import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const prefix = `INV-${year}-`;
  const lastInvoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: 'desc' },
  });
  let seq = 1;
  if (lastInvoice) {
    const lastSeq = parseInt(lastInvoice.invoiceNumber.slice(-3));
    seq = lastSeq + 1;
  }
  return prefix + String(seq).padStart(3, '0');
}

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const { status, customerId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (status) where.status = status as string;
    if (customerId) where.customerId = customerId as string;
    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { customer: true, items: { include: { product: true } } },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);
    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, items: { include: { product: true } } },
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    console.log('📦 Received invoice data:', req.body);
    const { customerId, issueDate, dueDate, items, taxRate, notes, status } = req.body;

    // Validate required fields
    if (!customerId) {
      return res.status(400).json({ error: 'customerId is required' });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'At least one item is required' });
    }
    if (!dueDate) {
      return res.status(400).json({ error: 'dueDate is required' });
    }

    // Validate customer exists
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate subtotal and validate items
    let subtotal = 0;
    for (const item of items) {
      if (!item.description || !item.quantity || !item.unitPrice) {
        return res.status(400).json({ error: 'Each item must have description, quantity, and unitPrice' });
      }
      subtotal += item.quantity * item.unitPrice;
    }

    const taxRateValue = taxRate ? parseFloat(taxRate) : 0;
    const taxAmount = subtotal * (taxRateValue / 100);
    const total = subtotal + taxAmount;

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: new Date(dueDate),
        subtotal,
        taxRate: taxRateValue,
        taxAmount,
        total,
        notes: notes || null,
        status: status || 'draft',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || null,
            description: item.description,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            total: parseFloat(item.quantity) * parseFloat(item.unitPrice),
          })),
        },
      },
      include: { customer: true, items: { include: { product: true } } },
    });
    res.status(201).json(invoice);
  } catch (error: any) {
    console.error('❌ Error creating invoice:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
};

export const updateInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status },
      include: { customer: true, items: { include: { product: true } } },
    });
    res.json(invoice);
  } catch (error: any) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.invoice.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: error.message });
  }
};
