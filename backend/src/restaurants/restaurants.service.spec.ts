import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsService } from './restaurants.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';

const mockPrismaService = {
  restaurant: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  menuItem: {
    findMany: jest.fn(),
  },
};

describe('RestaurantsService', () => {
  let service: RestaurantsService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all restaurants for admin (no country filter)', async () => {
      const adminUser = {
        id: '1',
        role: Role.ADMIN,
        countryId: null,
      } as unknown as User;
      prisma.restaurant.findMany.mockResolvedValue([]);

      await service.findAll(adminUser);

      expect(prisma.restaurant.findMany).toHaveBeenCalledWith({
        where: {},
        include: { country: true, menuItems: true },
        orderBy: { name: 'asc' },
      });
    });

    it('should filter by country for non-admin users', async () => {
      const user = {
        id: '2',
        role: Role.MEMBER,
        countryId: '1',
      } as unknown as User;
      prisma.restaurant.findMany.mockResolvedValue([]);

      await service.findAll(user);

      expect(prisma.restaurant.findMany).toHaveBeenCalledWith({
        where: { countryId: '1' },
        include: { country: true, menuItems: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    const restaurant = {
      id: 'res-1',
      countryId: '1',
      name: 'Test Restaurant',
    };

    it('should return null if restaurant not found', async () => {
      prisma.restaurant.findUnique.mockResolvedValue(null);
      const user = { id: '1', role: Role.ADMIN } as unknown as User;

      const result = await service.findOne('res-1', user);
      expect(result).toBeNull();
    });

    it('should return restaurant for admin', async () => {
      prisma.restaurant.findUnique.mockResolvedValue(restaurant);
      const user = { id: '1', role: Role.ADMIN } as unknown as User;

      const result = await service.findOne('res-1', user);
      expect(result).toEqual(restaurant);
    });

    it('should return restaurant if user in same country', async () => {
      prisma.restaurant.findUnique.mockResolvedValue(restaurant);
      const user = {
        id: '2',
        role: Role.MEMBER,
        countryId: '1',
      } as unknown as User;

      const result = await service.findOne('res-1', user);
      expect(result).toEqual(restaurant);
    });

    it('should return null if user in different country', async () => {
      prisma.restaurant.findUnique.mockResolvedValue(restaurant);
      const user = {
        id: '3',
        role: Role.MEMBER,
        countryId: '2',
      } as unknown as User;

      const result = await service.findOne('res-1', user);
      expect(result).toBeNull();
    });
  });
});
