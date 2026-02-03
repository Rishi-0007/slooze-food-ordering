import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, OrderStatus, Role } from '@prisma/client';
import { AddToCartInput, UpdateCartItemInput, CheckoutInput } from './dto/order.input';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  // Get or create cart for user
  async getOrCreateCart(user: User) {
    let cart = await this.prisma.order.findFirst({
      where: {
        userId: user.id,
        status: OrderStatus.CART,
      },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.order.create({
        data: {
          userId: user.id,
          status: OrderStatus.CART,
        },
        include: {
          items: {
            include: { menuItem: true },
          },
        },
      });
    }

    return cart;
  }

  // Add item to cart
  async addToCart(input: AddToCartInput, user: User & { countryId?: string | null }) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: input.menuItemId },
      include: { restaurant: true },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    // Check country-based access for non-admin users
    if (user.countryId && menuItem.restaurant.countryId !== user.countryId) {
      throw new ForbiddenException('You can only order from restaurants in your country');
    }

    const cart = await this.getOrCreateCart(user);

    // Check if item already in cart
    const existingItem = await this.prisma.orderItem.findUnique({
      where: {
        orderId_menuItemId: {
          orderId: cart.id,
          menuItemId: input.menuItemId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      await this.prisma.orderItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + input.quantity },
      });
    } else {
      // Add new item
      await this.prisma.orderItem.create({
        data: {
          orderId: cart.id,
          menuItemId: input.menuItemId,
          quantity: input.quantity,
          price: menuItem.price,
        },
      });
    }

    // Recalculate total
    await this.recalculateTotal(cart.id);

    return this.prisma.order.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });
  }

  // Update cart item quantity
  async updateCartItem(input: UpdateCartItemInput, user: User) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: input.orderItemId },
      include: { order: true },
    });

    if (!orderItem || orderItem.order.userId !== user.id) {
      throw new NotFoundException('Cart item not found');
    }

    if (orderItem.order.status !== OrderStatus.CART) {
      throw new BadRequestException('Can only update items in cart');
    }

    if (input.quantity === 0) {
      // Remove item
      await this.prisma.orderItem.delete({
        where: { id: input.orderItemId },
      });
    } else {
      // Update quantity
      await this.prisma.orderItem.update({
        where: { id: input.orderItemId },
        data: { quantity: input.quantity },
      });
    }

    await this.recalculateTotal(orderItem.orderId);

    return this.prisma.order.findUnique({
      where: { id: orderItem.orderId },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });
  }

  // Checkout - Only ADMIN and MANAGER can do this
  async checkout(input: CheckoutInput, user: User) {
    if (user.role === Role.MEMBER) {
      throw new ForbiddenException('You do not have permission to checkout');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: input.orderId },
      include: { items: true },
    });

    if (!order || order.userId !== user.id) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.CART) {
      throw new BadRequestException('Order is not in cart status');
    }

    if (order.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Verify payment method exists
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: input.paymentMethodId },
    });

    if (!paymentMethod || paymentMethod.userId !== user.id) {
      throw new NotFoundException('Payment method not found');
    }

    // Update order status to CONFIRMED
    return this.prisma.order.update({
      where: { id: input.orderId },
      data: { status: OrderStatus.CONFIRMED },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });
  }

  // Cancel order - Only ADMIN and MANAGER can do this
  async cancelOrder(orderId: string, user: User) {
    if (user.role === Role.MEMBER) {
      throw new ForbiddenException('You do not have permission to cancel orders');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== user.id) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });
  }

  // Get user's orders
  async getUserOrders(user: User) {
    return this.prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get a specific order
  async getOrder(orderId: string, user: User) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    if (!order || order.userId !== user.id) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // Recalculate order total
  private async recalculateTotal(orderId: string) {
    const items = await this.prisma.orderItem.findMany({
      where: { orderId },
    });

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await this.prisma.order.update({
      where: { id: orderId },
      data: { totalPrice: total },
    });
  }
}
