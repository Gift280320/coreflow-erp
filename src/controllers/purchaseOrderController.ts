import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const where: any = {};
    if (status) where.status = status as string;
    const [data, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          creator: { select: { id: true, firstName: true, lastName: true, email: true } },
          items: { include: { product: true } },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.purchaseOrder.count({ where }),
    ]);
    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { supplierId, items, notes, orderDate, expectedDate, createdBy } = req.body;
    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'supplierId and items are required' });
    }

    // Generate order number (simple timestamp-based)
    const orderNumber = `PO-${Date.now()}`;

    const totalAmount = items.reduce((sum: number, item: any) => {
      const price = parseFloat(item.unitPrice) * parseInt(item.quantity);
      return sum + price;
    }, 0);

    const order = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId,
        status: 'DRAFT',
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        totalAmount,
        notes: notes || null,
        createdBy: createdBy || (req as any).user?.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.unitPrice) * parseInt(item.quantity),
          })),
        },
      },
      include: {
        supplier: true,
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: { include: { product: true } },
      },
    });
    res.status(201).json(order);
  } catch (error: any) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getPurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: { include: { product: true } },
      },
    });
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (error: any) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updatePurchaseOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: { status },
      include: {
        supplier: true,
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        items: { include: { product: true } },
      },
    });
    res.json(order);
  } catch (error: any) {
    console.error('Error updating purchase order status:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deletePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Delete items first (cascade not set by default)
    await prisma.purchaseOrderItem.deleteMany({ where: { orderId: id } });
    await prisma.purchaseOrder.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ error: error.message });
  }
};
