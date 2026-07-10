import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { accountId, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (accountId) where.accountId = accountId as string;
    if (dateFrom) where.date = { gte: new Date(dateFrom as string) };
    if (dateTo) where.date = { ...(where.date || {}), lte: new Date(dateTo as string) };
    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { account: true },
        skip,
        take: Number(limit),
        orderBy: { date: 'desc' },
      }),
      prisma.expense.count({ where }),
    ]);
    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { accountId, amount, description, date, reference, paidBy } = req.body;
    if (!accountId || !amount || !description) {
      return res.status(400).json({ error: 'accountId, amount, description are required' });
    }
    const expense = await prisma.expense.create({
      data: {
        accountId,
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
        reference: reference || null,
        paidBy: paidBy || null,
      },
      include: { account: true },
    });
    res.status(201).json(expense);
  } catch (error: any) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: error.message });
  }
};
