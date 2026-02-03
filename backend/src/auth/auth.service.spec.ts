import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: typeof mockPrismaService;
  let jwt: typeof mockJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwt = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginInput = {
      email: 'test@example.com',
      password: 'password',
    };

    const user = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'MEMBER',
      countryId: '1',
      country: { id: '1', name: 'India' },
    };

    it('should return token and user on successful login', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      const result = await service.login(loginInput);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginInput.email },
        include: { country: true },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginInput.password,
        user.password,
      );
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        account: undefined,
        accessToken: 'token',
        user: { ...user, country: { id: '1', name: 'India' } },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    const registerInput = {
      email: 'new@example.com',
      password: 'password',
      name: 'New User',
      countryId: '1',
    };

    const newUser = {
      id: '2',
      email: 'new@example.com',
      password: 'hashedPassword',
      name: 'New User',
      role: 'MEMBER',
      countryId: '1',
      country: { id: '1', name: 'India' },
    };

    it('should create user and return token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      prisma.user.create.mockResolvedValue(newUser);
      jwt.sign.mockReturnValue('token');

      const result = await service.register(registerInput);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerInput.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerInput.password, 10);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'token',
        user: { ...newUser, country: { id: '1', name: 'India' } },
      });
    });

    it('should throw ConflictException if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.register(registerInput)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
