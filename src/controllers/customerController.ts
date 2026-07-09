import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.customer.count({ where }),
    ]);
    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, taxId } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const customer = await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        taxId: taxId || null,
      },
    });
    res.status(201).json(customer);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, taxId, isActive } = req.body;
    const customer = await prisma.customer.update({
      where: { id },
      data: { name, email, phone, address, taxId, isActive },
    });
    res.json(customer);
  } catch (error: any) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: error.message });
  }
};
