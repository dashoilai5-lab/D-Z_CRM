import type { IMotorcycleRepository } from "./repository";
import { PrismaMotorcycleRepository } from "@/repositories/prisma/motorcycles.repository";

export class MotorcycleService {
  constructor(private repo: IMotorcycleRepository = new PrismaMotorcycleRepository()) {}

  async getForCustomer(customerId: string) {
    const bikes = await this.repo.listByCustomer(customerId);
    return bikes.map((b) => ({
      id: b.id, brand: b.brand, model: b.model, year: b.year, plate: b.plate, color: b.color,
      currentMileage: b.currentMileage, nextServiceMileage: b.nextServiceMileage, nextServiceEstDate: b.nextServiceEstDate,
      lastServiceDate: b.lastServiceDate, lastServiceMileage: b.lastServiceMileage,
    }));
  }

  async getPassport(motorcycleId: string) {
    const m = await this.repo.getById(motorcycleId);
    if (!m) return null;
    return {
      id: m.id, brand: m.brand, model: m.model, year: m.year, plate: m.plate, color: m.color, vin: m.vin, type: m.type,
      currentMileage: m.currentMileage,
      lastServiceDate: m.lastServiceDate, lastServiceMileage: m.lastServiceMileage,
      lastOilChangeMileage: m.lastOilChangeMileage, lastOilFilterMileage: m.lastOilFilterMileage,
      nextServiceMileage: m.nextServiceMileage, nextServiceEstDate: m.nextServiceEstDate,
      customer: { id: m.customer.id, name: m.customer.name, phone: m.customer.phone },
    };
  }
}

export const motorcycleService = new MotorcycleService();
