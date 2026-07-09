import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getWarehouses = async (req: Request, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
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
    const { name, location } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const warehouse = await prisma.warehouse.create({
      data: { name, location: location || null },
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
    const { name, location, isActive } = req.body;
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: { name, location, isActive },
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
    await prisma.warehouse.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting warehouse:', error);
    res.status(500).json({ error: error.message });
  }
};
