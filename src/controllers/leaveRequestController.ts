import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const { employeeId, status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (employeeId) where.employeeId = employeeId as string;
    if (status) where.status = status as string;
    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: { employee: { include: { user: true, department: true } }, leaveType: true },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leaveRequest.count({ where }),
    ]);
    res.json({ data: requests, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { employeeId, leaveTypeId, startDate, endDate, days, reason } = req.body;
    if (!employeeId || !leaveTypeId || !startDate || !endDate || !days) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days: parseFloat(days),
        reason: reason || null,
        status: 'pending',
      },
      include: { employee: { include: { user: true } }, leaveType: true },
    });
    res.status(201).json(leaveRequest);
  } catch (error: any) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateLeaveRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, approvedBy } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });
    const data: any = { status };
    if (status === 'approved' || status === 'rejected') {
      data.approvedAt = new Date();
      if (approvedBy) data.approvedBy = approvedBy;
    }
    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data,
      include: { employee: { include: { user: true } }, leaveType: true },
    });
    res.json(leaveRequest);
  } catch (error: any) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.leaveRequest.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({ error: error.message });
  }
};
