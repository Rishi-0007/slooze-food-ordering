import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';
import {
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from './dto/payment-method.input';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  // Check if user is admin
  private checkAdminAccess(user: User) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can manage payment methods');
    }
  }

  // Get all payment methods for user
  async findAll(user: User) {
    return this.prisma.paymentMethod.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  // Get a specific payment method
  async findOne(id: string, user: User) {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!paymentMethod || paymentMethod.userId !== user.id) {
      throw new NotFoundException('Payment method not found');
    }

    return paymentMethod;
  }

  // Create payment method - ADMIN only
  async create(input: CreatePaymentMethodInput, user: User) {
    this.checkAdminAccess(user);

    const targetUserId = input.userId || user.id;

    // If this is the first or marked as default, unset other defaults
    if (input.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: targetUserId },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.create({
      data: {
        type: input.type,
        details: input.details,
        isDefault: input.isDefault ?? false,
        userId: targetUserId,
      },
    });
  }

  // Update payment method - ADMIN only
  async update(input: UpdatePaymentMethodInput, user: User) {
    this.checkAdminAccess(user);

    const paymentMethod = await this.findOne(input.id, user);

    // If setting as default, unset other defaults
    if (input.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: user.id, id: { not: input.id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.update({
      where: { id: paymentMethod.id },
      data: {
        type: input.type ?? paymentMethod.type,
        details: input.details ?? paymentMethod.details,
        isDefault: input.isDefault ?? paymentMethod.isDefault,
      },
    });
  }

  // Delete payment method - ADMIN only
  async delete(id: string, user: User) {
    this.checkAdminAccess(user);

    const paymentMethod = await this.findOne(id, user);

    await this.prisma.paymentMethod.delete({
      where: { id: paymentMethod.id },
    });

    return paymentMethod;
  }
}
