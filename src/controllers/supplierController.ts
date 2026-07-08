import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
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
    const { name, contactPerson, email, phone, address, taxId } = req.body;
    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactPerson: contactPerson || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        taxId: taxId || null,
      },
    });
    res.status(201).json(supplier);
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: error.message, code: error.code });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contactPerson, email, phone, address, taxId, isActive } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        contactPerson: contactPerson || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        taxId: taxId || null,
        isActive,
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
    await prisma.supplier.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: error.message });
  }
};
