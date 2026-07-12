import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAssets = async (req: Request, res: Response) => {
  try {
    const { category, status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (category) where.category = category as string;
    if (status) where.status = status as string;
    const [data, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: { employee: { include: { user: true } }, maintenanceRecords: true },
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.asset.count({ where }),
    ]);
    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createAsset = async (req: Request, res: Response) => {
  try {
    const { name, serialNumber, description, category, purchaseDate, cost, depreciationRate, status, assignedTo, location, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const asset = await prisma.asset.create({
      data: {
        name,
        serialNumber: serialNumber || null,
        description: description || null,
        category: category || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        cost: cost ? parseFloat(cost) : null,
        depreciationRate: depreciationRate ? parseFloat(depreciationRate) : 0,
        currentValue: cost ? parseFloat(cost) : null,
        status: status || 'active',
        assignedTo: assignedTo || null,
        location: location || null,
        notes: notes || null,
      },
      include: { employee: { include: { user: true } } },
    });
    res.status(201).json(asset);
  } catch (error: any) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, serialNumber, description, category, purchaseDate, cost, depreciationRate, status, assignedTo, location, notes } = req.body;
    const asset = await prisma.asset.update({
      where: { id },
      data: {
        name,
        serialNumber: serialNumber || null,
        description: description || null,
        category: category || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        cost: cost ? parseFloat(cost) : null,
        depreciationRate: depreciationRate ? parseFloat(depreciationRate) : 0,
        currentValue: cost ? parseFloat(cost) : null,
        status: status || 'active',
        assignedTo: assignedTo || null,
        location: location || null,
        notes: notes || null,
      },
      include: { employee: { include: { user: true } } },
    });
    res.json(asset);
  } catch (error: any) {
    console.error('Error updating asset:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.asset.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: error.message });
  }
};
