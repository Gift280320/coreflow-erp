import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStockItems = async (req: Request, res: Response) => {
  try {
    const { productId, warehouseId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (productId) where.productId = productId as string;
    if (warehouseId) where.warehouseId = warehouseId as string;
    const [data, total] = await Promise.all([
      prisma.stockItem.findMany({
        where,
        include: { product: true, warehouse: true },
        skip,
        take: Number(limit),
        orderBy: { product: { name: 'asc' } },
      }),
      prisma.stockItem.count({ where }),
    ]);
    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error('Error fetching stock items:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { productId, warehouseId, quantity, note } = req.body;
    if (!productId || !warehouseId || quantity === undefined) {
      return res.status(400).json({ error: 'productId, warehouseId, quantity are required' });
    }
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) return res.status(404).json({ error: 'Warehouse not found' });

    const qty = parseFloat(quantity);
    const stockItem = await prisma.stockItem.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      update: { quantity: { increment: qty } },
      create: { productId, warehouseId, quantity: qty },
      include: { product: true, warehouse: true },
    });

    await prisma.stockMovement.create({
      data: {
        productId,
        warehouseId,
        quantity: qty,
        type: 'adjustment',
        note: note || 'Stock adjustment',
      },
    });

    res.json(stockItem);
  } catch (error: any) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const { productId, warehouseId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (productId) where.productId = productId as string;
    if (warehouseId) where.warehouseId = warehouseId as string;
    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: { product: true, warehouse: true },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockMovement.count({ where }),
    ]);
    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: error.message });
  }
};
