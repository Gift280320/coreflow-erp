import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getWarehouses = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    const warehouses = await prisma.warehouse.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    res.json(warehouses);
  } catch (error: any) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const { name, code, location, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        code: code || null,
        location: location || null,
        status: status || 'ACTIVE',
      },
    });
    res.status(201).json(warehouse);
  } catch (error: any) {
    console.error('Error creating warehouse:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, location, status } = req.body;

    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Warehouse not found' });

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        code: code !== undefined ? code : existing.code,
        location: location !== undefined ? location : existing.location,
        status: status !== undefined ? status : existing.status,
      },
    });
    res.json(warehouse);
  } catch (error: any) {
    console.error('Error updating warehouse:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.warehouse.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Warehouse not found' });
    await prisma.warehouse.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting warehouse:', error);
    res.status(500).json({ error: error.message });
  }
};
