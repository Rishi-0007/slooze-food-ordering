import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginInput, RegisterInput } from './dto/auth.input';
import { AuthResponse } from './dto/auth.response';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginInput.email },
      include: { country: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(
      loginInput.password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      countryId: user.countryId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: { ...user, country: user.country ?? undefined },
    };
  }

  async register(registerInput: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerInput.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerInput.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerInput.email,
        password: hashedPassword,
        name: registerInput.name,
      },
      include: { country: true },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      countryId: user.countryId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: { ...user, country: user.country ?? undefined },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { country: true },
    });
  }
}
