import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, category, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category as string;

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { supplier: true },
        skip,
        take: limitNum,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, description, category, unitPrice, costPrice, stock, reorderLevel, warehouseId, supplierId, status } = req.body;

    if (!name || !sku) return res.status(400).json({ error: 'name and sku are required' });
    if (unitPrice === undefined || costPrice === undefined) return res.status(400).json({ error: 'unitPrice and costPrice are required' });

    const product = await prisma.product.create({
      data: {
        name, sku, description, category,
        unitPrice: parseFloat(unitPrice),
        costPrice: parseFloat(costPrice),
        stock: stock ? parseInt(stock) : 0,
        reorderLevel: reorderLevel ? parseInt(reorderLevel) : 10,
        warehouseId: warehouseId || null,
        supplierId: supplierId || null,
        status: status || 'ACTIVE',
      },
      include: { supplier: true },
    });
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sku, description, category, unitPrice, costPrice, stock, reorderLevel, warehouseId, supplierId, status } = req.body;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (sku !== undefined) data.sku = sku;
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (unitPrice !== undefined) data.unitPrice = parseFloat(unitPrice);
    if (costPrice !== undefined) data.costPrice = parseFloat(costPrice);
    if (stock !== undefined) data.stock = parseInt(stock);
    if (reorderLevel !== undefined) data.reorderLevel = parseInt(reorderLevel);
    if (warehouseId !== undefined) data.warehouseId = warehouseId || null;
    if (supplierId !== undefined) data.supplierId = supplierId || null;
    if (status !== undefined) data.status = status;

    const product = await prisma.product.update({
      where: { id }, data,
      include: { supplier: true },
    });
    res.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
};
