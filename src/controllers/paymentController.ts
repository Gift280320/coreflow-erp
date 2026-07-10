import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPayments = async (req: Request, res: Response) => {
  try {
    const { invoiceId, customerId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (invoiceId) where.invoiceId = invoiceId as string;
    if (customerId) where.customerId = customerId as string;
    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { invoice: true, customer: true },
        skip,
        take: Number(limit),
        orderBy: { paymentDate: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);
    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { invoiceId, amount, paymentDate, method, reference, notes } = req.body;
    if (!invoiceId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'invoiceId and positive amount are required' });
    }
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const totalPaid = invoice.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const remaining = invoice.total - totalPaid;
    if (amount > remaining) {
      return res.status(400).json({ error: `Payment amount exceeds remaining balance (${remaining.toFixed(2)})` });
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        customerId: invoice.customerId,
        amount,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        method: method || null,
        reference: reference || null,
        notes: notes || null,
      },
      include: { invoice: true, customer: true },
    });

    const newTotalPaid = totalPaid + amount;
    let newStatus = invoice.status;
    if (newTotalPaid >= invoice.total) {
      newStatus = 'paid';
    } else if (newTotalPaid > 0) {
      newStatus = 'partial';
    }
    if (newStatus !== invoice.status) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });
    }

    res.status(201).json(payment);
  } catch (error: any) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    await prisma.payment.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: error.message });
  }
};
