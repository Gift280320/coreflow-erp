import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const dateStr = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const prefix = `PO-${dateStr}-`;
  const lastOrder = await prisma.purchaseOrder.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
  });
  let seq = 1;
  if (lastOrder) {
    const lastSeq = parseInt(lastOrder.orderNumber.slice(-3));
    seq = lastSeq + 1;
  }
  return prefix + String(seq).padStart(3, '0');
}

export const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const { status, supplierId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (status) where.status = status as string;
    if (supplierId) where.supplierId = supplierId as string;
    const [data, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: { supplier: true, purchaseRequest: { include: { user: true, department: true } } },
        skip,
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
    console.log('📦 Received purchase order data:', req.body);
    let { supplierId, purchaseRequestId, orderNumber, orderDate, totalAmount, status } = req.body;
    // Auto-generate order number if not provided or empty
    if (!orderNumber || orderNumber.trim() === '') {
      orderNumber = await generateOrderNumber();
      console.log('✅ Auto-generated order number:', orderNumber);
    }
    // Validate required fields
    if (!supplierId) {
      return res.status(400).json({ error: 'supplierId is required' });
    }
    if (!totalAmount || isNaN(parseFloat(totalAmount))) {
      return res.status(400).json({ error: 'totalAmount must be a valid number' });
    }
    // Convert empty purchaseRequestId to null
    const prId = purchaseRequestId && purchaseRequestId.trim() !== '' ? purchaseRequestId : null;
    const total = parseFloat(totalAmount);
    // Check supplier exists
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      return res.status(404).json({ error: `Supplier with ID ${supplierId} not found.` });
    }
    // If linking to a purchase request, verify it exists and is approved
    if (prId) {
      const pr = await prisma.purchaseRequest.findUnique({ where: { id: prId } });
      if (!pr) {
        return res.status(404).json({ error: `Purchase request ${prId} not found.` });
      }
      if (pr.status !== 'approved') {
        return res.status(400).json({ error: 'Only approved purchase requests can be linked.' });
      }
    }
    const order = await prisma.purchaseOrder.create({
      data: {
        supplierId,
        purchaseRequestId: prId,
        orderNumber,
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        totalAmount: total,
        status: status || 'draft',
      },
      include: { supplier: true, purchaseRequest: true },
    });
    // Update purchase request status if linked
    if (prId) {
      await prisma.purchaseRequest.update({
        where: { id: prId },
        data: { status: 'ordered' },
      });
    }
    res.status(201).json(order);
  } catch (error: any) {
    console.error('❌ Error creating purchase order:', error);
    // Handle duplicate order number
    if (error.code === 'P2002' && error.meta?.target?.includes('orderNumber')) {
      return res.status(400).json({ error: 'Order number already exists. Please use a unique number or leave blank to auto-generate.' });
    }
    // Send detailed error to frontend
    res.status(500).json({
      error: error.message,
      code: error.code,
      meta: error.meta,
    });
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
      include: { supplier: true, purchaseRequest: true },
    });
    res.json(order);
  } catch (error: any) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deletePurchaseOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.purchaseOrder.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ error: error.message });
  }
};
