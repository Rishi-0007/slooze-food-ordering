import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethod } from './entities/payment-method.entity';
import {
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from './dto/payment-method.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';
import { Role } from '@prisma/client';

@Resolver(() => PaymentMethod)
@UseGuards(GqlAuthGuard)
export class PaymentMethodsResolver {
  constructor(private paymentMethodsService: PaymentMethodsService) {}

  @Query(() => [PaymentMethod])
  async paymentMethods(@CurrentUser() user: User) {
    return this.paymentMethodsService.findAll(user);
  }

  @Query(() => PaymentMethod, { nullable: true })
  async paymentMethod(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentMethodsService.findOne(id, user);
  }

  @Mutation(() => PaymentMethod)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createPaymentMethod(
    @Args('input') input: CreatePaymentMethodInput,
    @CurrentUser() user: User,
  ) {
    return this.paymentMethodsService.create(input, user);
  }

  @Mutation(() => PaymentMethod)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updatePaymentMethod(
    @Args('input') input: UpdatePaymentMethodInput,
    @CurrentUser() user: User,
  ) {
    return this.paymentMethodsService.update(input, user);
  }

  @Mutation(() => PaymentMethod)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deletePaymentMethod(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.paymentMethodsService.delete(id, user);
  }
}
