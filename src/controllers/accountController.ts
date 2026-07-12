import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAccounts = async (req: Request, res: Response) => {
  try {
    const accounts = await prisma.account.findMany({
      include: { children: true },
      orderBy: { code: 'asc' },
    });
    res.json(accounts);
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createAccount = async (req: Request, res: Response) => {
  try {
    const { code, name, type, description, parentId } = req.body;
    if (!code || !name || !type) {
      return res.status(400).json({ error: 'code, name, type are required' });
    }
    const existing = await prisma.account.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ error: `Account with code ${code} already exists` });
    }
    const account = await prisma.account.create({
      data: {
        code,
        name,
        type,
        description: description || null,
        parentId: parentId || null,
      },
      include: { children: true },
    });
    res.status(201).json(account);
  } catch (error: any) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, type, description, parentId, isActive } = req.body;
    const account = await prisma.account.update({
      where: { id },
      data: { code, name, type, description, parentId, isActive },
      include: { children: true },
    });
    res.json(account);
  } catch (error: any) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.account.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: error.message });
  }
};
