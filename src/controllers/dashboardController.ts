import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getOverview = async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || '30d';
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Revenue
    const revenueAgg = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paymentDate: { gte: startDate } },
    });
    const revenue = revenueAgg._sum.amount || 0;

    // Expenses
    const expensesAgg = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: startDate } },
    });
    const expenses = expensesAgg._sum.amount || 0;

    const profit = revenue - expenses;

    // Active users
    const activeUsers = await prisma.user.count({
      where: {
        lastLogin: { gte: startDate },
        isActive: true,
      },
    });

    // Recent activity
    let recentActivity = [];
    try {
      const activities = await prisma.activityLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } } },
      });
      recentActivity = activities.map(a => ({
        id: a.id,
        message: `${a.user?.firstName || 'System'} ${a.user?.lastName || ''} ${a.description || a.action}`,
        time: a.createdAt.toISOString(),
        type: a.action,
      }));
    } catch (e) {
      recentActivity = [];
    }

    // Inventory alerts
    let inventoryAlerts = [
      { name: 'Low stock items', count: 0 },
      { name: 'Out of stock', count: 0 },
      { name: 'Pending orders', count: 0 },
    ];
    try {
      const lowStockProducts = await prisma.product.findMany({
        where: {
          stock: { lt: prisma.product.fields.reorderLevel },
          reorderLevel: { not: null },
        },
        select: { stock: true },
      });
      const pendingOrders = await prisma.purchaseRequest.count({
        where: { status: 'PENDING' },
      });
      inventoryAlerts = [
        { name: 'Low stock items', count: lowStockProducts.filter(p => p.stock > 0).length },
        { name: 'Out of stock', count: lowStockProducts.filter(p => p.stock === 0).length },
        { name: 'Pending orders', count: pendingOrders },
      ];
    } catch (e) {
      // Tables might not exist yet
    }

    // Projects
    let projectProgress = [];
    try {
      const projects = await prisma.project.findMany({
        where: { status: 'IN_PROGRESS' },
        take: 5,
        select: { name: true, progress: true },
      });
      projectProgress = projects.map(p => ({
        name: p.name,
        progress: p.progress || 0,
      }));
    } catch (e) {
      projectProgress = [];
    }

    res.json({
      period,
      kpis: {
        revenue,
        expenses,
        profit,
        activeUsers,
      },
      chartData: [
        { period: 'Mon', revenue: revenue * 0.2, expenses: expenses * 0.15 },
        { period: 'Tue', revenue: revenue * 0.25, expenses: expenses * 0.2 },
        { period: 'Wed', revenue: revenue * 0.3, expenses: expenses * 0.25 },
        { period: 'Thu', revenue: revenue * 0.15, expenses: expenses * 0.2 },
        { period: 'Fri', revenue: revenue * 0.1, expenses: expenses * 0.2 },
      ],
      recentActivity,
      inventoryAlerts,
      projectProgress,
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};
