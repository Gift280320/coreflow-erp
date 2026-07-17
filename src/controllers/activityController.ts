import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    let activities = [];
    try {
      activities = await prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      });
    } catch (e) {
      return res.json([]);
    }

    const formatted = activities.map(a => ({
      id: a.id,
      message: `${a.user?.firstName || 'System'} ${a.user?.lastName || ''} ${a.description || a.action}`,
      createdAt: a.createdAt,
      type: a.entity?.toLowerCase() || 'system',
      read: false,
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('Activity error:', error);
    res.status(500).json({ error: error.message });
  }
};
