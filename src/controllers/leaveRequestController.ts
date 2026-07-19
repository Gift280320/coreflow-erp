import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLeaveRequests = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const employee = await prisma.employee.findFirst({
      where: { userId: user.id },
    });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found for this user' });
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { employeeId: employee.id },
      include: {
        leaveType: true,
        employee: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
        approver: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(leaveRequests);
  } catch (error: any) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createLeaveRequest = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { leaveTypeId, startDate, endDate, reason } = req.body;

    if (!leaveTypeId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Leave type, start date, and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }

    // Find employee using findFirst (userId is not unique)
    const employee = await prisma.employee.findFirst({
      where: { userId: user.id },
    });
    if (!employee) {
      return res.status(404).json({ error: 'No employee record found for this user' });
    }

    const leaveType = await prisma.leaveType.findUnique({
      where: { id: leaveTypeId },
    });
    if (!leaveType) {
      return res.status(400).json({ error: 'Invalid leave type' });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveTypeId,
        startDate: start,
        endDate: end,
        reason: reason || null,
        status: 'PENDING',
      },
      include: {
        leaveType: true,
        employee: {
          include: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
      },
    });

    res.status(201).json(leaveRequest);
  } catch (error: any) {
    console.error('Create leave request error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { leaveTypeId, startDate, endDate, reason, status } = req.body;

    const existing = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const data: any = {};
    if (leaveTypeId) data.leaveTypeId = leaveTypeId;
    if (startDate) data.startDate = new Date(startDate);
    if (endDate) data.endDate = new Date(endDate);
    if (reason !== undefined) data.reason = reason;
    if (status) data.status = status;

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data,
      include: { leaveType: true, employee: { include: { user: true } } },
    });
    res.json(leaveRequest);
  } catch (error: any) {
    console.error('Update leave request error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    await prisma.leaveRequest.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Delete leave request error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const approveLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const existing = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: user.id,
        approvedAt: new Date(),
      },
      include: { leaveType: true, employee: { include: { user: true } }, approver: true },
    });
    res.json(leaveRequest);
  } catch (error: any) {
    console.error('Approve leave request error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const rejectLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const existing = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedBy: user.id,
        approvedAt: new Date(),
      },
      include: { leaveType: true, employee: { include: { user: true } }, approver: true },
    });
    res.json(leaveRequest);
  } catch (error: any) {
    console.error('Reject leave request error:', error);
    res.status(500).json({ error: error.message });
  }
};
