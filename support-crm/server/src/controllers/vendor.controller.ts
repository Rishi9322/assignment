import { NextFunction, Request, Response } from "express";
import { vendorRepository } from "../repositories/vendor.repository";
import { computeVendorReliability } from "../utils/vendorReliability";

export const vendorController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const vendors = await vendorRepository.listAllWithTicketHistory();
      res.json(
        vendors.map((v) => ({
          id: v.id,
          name: v.name,
          type: v.type,
          contact_email: v.contactEmail,
          contact_phone: v.contactPhone,
          notes: v.notes,
          reliability: computeVendorReliability(v.tickets),
        }))
      );
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const vendor = await vendorRepository.create(req.body);
      res.status(201).json({
        id: vendor.id,
        name: vendor.name,
        type: vendor.type,
        contact_email: vendor.contactEmail,
        contact_phone: vendor.contactPhone,
        notes: vendor.notes,
      });
    } catch (err) {
      next(err);
    }
  },
};
