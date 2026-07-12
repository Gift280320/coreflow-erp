import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBudgets = async (req: Request, res: Response) => {
  try {
    const { accountId, year, period } = req.query;
    const where: any = {};
    if (accountId) where.accountId = accountId as string;
    if (year) where.year = parseInt(year as string);
    if (period) where.period = period as string;
    const budgets = await prisma.budget.findMany({
      where,
      include: { account: true },
      orderBy: { account: { code: 'asc' } },
    });
    res.json(budgets);
  } catch (error: any) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createBudget = async (req: Request, res: Response) => {
  try {
    const { accountId, amount, period, year, month } = req.body;
    if (!accountId || !amount || !period || !year) {
      return res.status(400).json({ error: 'accountId, amount, period, year are required' });
    }
    const budget = await prisma.budget.create({
      data: {
        accountId,
        amount: parseFloat(amount),
        period,
        year: parseInt(year),
        month: month ? parseInt(month) : null,
      },
      include: { account: true },
    });
    res.status(201).json(budget);
  } catch (error: any) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.budget.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: error.message });
  }
};
