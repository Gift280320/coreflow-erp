import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    res.json(suppliers);
  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, taxId, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        taxId: taxId || null,
        status: status || 'ACTIVE',
      },
    });
    res.status(201).json(supplier);
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, taxId, status } = req.body;
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Supplier not found' });

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        email: email !== undefined ? email : existing.email,
        phone: phone !== undefined ? phone : existing.phone,
        address: address !== undefined ? address : existing.address,
        taxId: taxId !== undefined ? taxId : existing.taxId,
        status: status !== undefined ? status : existing.status,
      },
    });
    res.json(supplier);
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Supplier not found' });
    await prisma.supplier.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: error.message });
  }
};
