import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
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
        include: { stockItems: { include: { warehouse: true } } },
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);
    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, description, category, unitPrice } = req.body;
    if (!name || !sku) {
      return res.status(400).json({ error: 'name and sku are required' });
    }
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description: description || null,
        category: category || null,
        unitPrice: parseFloat(unitPrice) || 0,
      },
    });
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sku, description, category, unitPrice, isActive } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        description: description || null,
        category: category || null,
        unitPrice: parseFloat(unitPrice) || 0,
        isActive,
      },
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
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
};
