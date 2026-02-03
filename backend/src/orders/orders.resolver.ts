import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import {
  AddToCartInput,
  UpdateCartItemInput,
  CheckoutInput,
} from './dto/order.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { User } from '@prisma/client';

@Resolver(() => Order)
@UseGuards(GqlAuthGuard)
export class OrdersResolver {
  constructor(private ordersService: OrdersService) {}

  @Query(() => Order)
  async cart(@CurrentUser() user: User) {
    return this.ordersService.getOrCreateCart(user);
  }

  @Query(() => [Order])
  async orders(@CurrentUser() user: User) {
    return this.ordersService.getUserOrders(user);
  }

  @Query(() => Order, { nullable: true })
  async order(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.getOrder(id, user);
  }

  @Mutation(() => Order)
  async addToCart(
    @Args('input') input: AddToCartInput,
    @CurrentUser() user: User & { countryId?: string | null },
  ) {
    return this.ordersService.addToCart(input, user);
  }

  @Mutation(() => Order)
  async updateCartItem(
    @Args('input') input: UpdateCartItemInput,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.updateCartItem(input, user);
  }

  @Mutation(() => Order)
  async checkout(
    @Args('input') input: CheckoutInput,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.checkout(input, user);
  }

  @Mutation(() => Order)
  async cancelOrder(
    @Args('orderId', { type: () => ID }) orderId: string,
    @CurrentUser() user: User,
  ) {
    return this.ordersService.cancelOrder(orderId, user);
  }
}
