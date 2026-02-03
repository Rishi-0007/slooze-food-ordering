import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  // Get all restaurants - filtered by user's country for non-admin users
  async findAll(user: User & { country?: { id: string } | null }) {
    const where: { countryId?: string } = {};

    // If user has a country (non-admin), filter by their country
    if (user.countryId) {
      where.countryId = user.countryId;
    }

    return this.prisma.restaurant.findMany({
      where,
      include: {
        country: true,
        menuItems: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  // Get restaurant by ID with country-based access check
  async findOne(id: string, user: User & { country?: { id: string } | null }) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        country: true,
        menuItems: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!restaurant) {
      return null;
    }

    // For non-admin users, check if restaurant belongs to their country
    if (user.countryId && restaurant.countryId !== user.countryId) {
      return null; // User cannot access restaurants from other countries
    }

    return restaurant;
  }

  // Get menu items for a restaurant
  async getMenuItems(
    restaurantId: string,
    user: User & { country?: { id: string } | null },
  ) {
    const restaurant = await this.findOne(restaurantId, user);

    if (!restaurant) {
      return [];
    }

    return this.prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: { name: 'asc' },
    });
  }
}
