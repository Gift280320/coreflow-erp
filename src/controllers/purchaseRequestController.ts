import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPurchaseRequests = async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const where: any = {};
    if (status) where.status = status as string;
    const [data, total] = await Promise.all([
      prisma.purchaseRequest.findMany({
        where,
        include: {
          department: true,
          requester: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.purchaseRequest.count({ where }),
    ]);
    res.json({ data, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error('Error fetching purchase requests:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createPurchaseRequest = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, quantity, departmentId, requestedBy } = req.body;
    if (!title || !requestedBy) {
      return res.status(400).json({ error: 'title and requestedBy are required' });
    }

    const request = await prisma.purchaseRequest.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'medium',
        quantity: quantity ? parseInt(quantity) : 1,
        departmentId: departmentId || null,
        requestedBy,
      },
      include: {
        department: true,
        requester: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    res.status(201).json(request);
  } catch (error: any) {
    console.error('Error creating purchase request:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updatePurchaseRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority, description } = req.body;
    const existing = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const request = await prisma.purchaseRequest.update({
      where: { id },
      data: {
        status: status || existing.status,
        priority: priority || existing.priority,
        description: description !== undefined ? description : existing.description,
      },
      include: {
        department: true,
        requester: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    res.json(request);
  } catch (error: any) {
    console.error('Error updating purchase request:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deletePurchaseRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.purchaseRequest.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting purchase request:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updatePurchaseRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    const existing = await prisma.purchaseRequest.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const request = await prisma.purchaseRequest.update({
      where: { id },
      data: { status },
      include: {
        department: true,
        requester: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    res.json(request);
  } catch (error: any) {
    console.error('Error updating purchase request status:', error);
    res.status(500).json({ error: error.message });
  }
};
