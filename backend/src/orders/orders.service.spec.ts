import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Role, User, Prisma } from '@prisma/client';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockPrismaService = {
  order: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  param: {
    findUnique: jest.fn(), // Typo in original service? No, it uses prisma.menuItem
  },
  menuItem: {
    findUnique: jest.fn(),
  },
  orderItem: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  paymentMethod: {
    findUnique: jest.fn(),
  },
};

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    const user = { id: 'u1', countryId: 'c1' } as unknown as User;
    const input = { menuItemId: 'm1', quantity: 2 };

    it('should throw NotFoundException if menuItem not found', async () => {
      prisma.menuItem.findUnique.mockResolvedValue(null);

      await expect(service.addToCart(input, user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if restaurant in different country', async () => {
      prisma.menuItem.findUnique.mockResolvedValue({
        id: 'm1',
        restaurant: { countryId: 'c2' },
      });

      await expect(service.addToCart(input, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should add item to existing cart', async () => {
      prisma.menuItem.findUnique.mockResolvedValue({
        id: 'm1',
        restaurant: { countryId: 'c1' },
      });
      // Mock getOrCreateCart internal call by mocking findFirst to return cart
      prisma.order.findFirst.mockResolvedValue({ id: 'cart1', items: [] });
      prisma.orderItem.findUnique.mockResolvedValue(null); // Item not in cart yet
      prisma.orderItem.create.mockResolvedValue({ id: 'oi1' });
      prisma.orderItem.findMany.mockResolvedValue([{ price: 10, quantity: 2 }]); // For recalculateTotal
      prisma.order.findUnique.mockResolvedValue({
        id: 'cart1',
        totalPrice: 20,
      });

      const result = await service.addToCart(input, user);

      expect(prisma.orderItem.create).toHaveBeenCalled();
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'cart1' },
        data: { totalPrice: 20 },
      });
      expect(result).toBeDefined();
    });
  });

  describe('checkout', () => {
    const input = { orderId: 'o1', paymentMethodId: 'pm1' };

    it('should throw ForbiddenException for MEMBER', async () => {
      const user = { id: 'u1', role: Role.MEMBER } as unknown as User;
      await expect(service.checkout(input, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should proceed for MANAGER', async () => {
      const user = { id: 'u1', role: Role.MANAGER } as unknown as User;

      prisma.order.findUnique.mockResolvedValue({
        id: 'o1',
        userId: 'u1',
        status: OrderStatus.CART,
        items: [{ id: 'i1' }],
      });

      prisma.paymentMethod.findUnique.mockResolvedValue({
        id: 'pm1',
        userId: 'u1',
      });

      prisma.order.update.mockResolvedValue({
        id: 'o1',
        status: OrderStatus.CONFIRMED,
      });

      await service.checkout(input, user);

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'o1' },
        data: { status: OrderStatus.CONFIRMED },
        include: expect.anything() as unknown as Prisma.OrderInclude,
      });
    });
  });
});
