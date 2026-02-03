import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { Restaurant, MenuItem } from './entities/restaurant.entity';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Resolver(() => Restaurant)
@UseGuards(GqlAuthGuard)
export class RestaurantsResolver {
  constructor(private restaurantsService: RestaurantsService) {}

  @Query(() => [Restaurant])
  async restaurants(
    @CurrentUser() user: User & { country?: { id: string } | null },
  ) {
    return this.restaurantsService.findAll(user);
  }

  @Query(() => Restaurant, { nullable: true })
  async restaurant(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User & { country?: { id: string } | null },
  ) {
    return this.restaurantsService.findOne(id, user);
  }

  @Query(() => [MenuItem])
  async menuItems(
    @Args('restaurantId', { type: () => ID }) restaurantId: string,
    @CurrentUser() user: User & { country?: { id: string } | null },
  ) {
    return this.restaurantsService.getMenuItems(restaurantId, user);
  }
}
