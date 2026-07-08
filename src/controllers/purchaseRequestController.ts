import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPurchaseRequests = async (req: Request, res: Response) => {
  try {
    const { status, departmentId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (status) where.status = status as string;
    if (departmentId) where.departmentId = departmentId as string;
    const [data, total] = await Promise.all([
      prisma.purchaseRequest.findMany({
        where,
        include: { user: true, department: true },
        skip,
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
    console.log('Received purchase request data:', req.body);
    const { requestedBy, departmentId, title, description, priority } = req.body;
    if (!requestedBy || !departmentId || !title) {
      return res.status(400).json({ error: 'requestedBy, departmentId, title are required' });
    }
    const request = await prisma.purchaseRequest.create({
      data: {
        requestedBy,
        departmentId,
        title,
        description: description || null,
        priority: priority || 'normal',
        status: 'pending',
      },
      include: { user: true, department: true },
    });
    res.status(201).json(request);
  } catch (error: any) {
    console.error('Error creating purchase request:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
};

export const updatePurchaseRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const data: any = { status };
    if (status === 'approved' || status === 'rejected') {
      data.approvedAt = new Date();
      if (approvedBy) data.approvedBy = approvedBy;
    }
    const request = await prisma.purchaseRequest.update({
      where: { id },
      data,
      include: { user: true, department: true },
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
