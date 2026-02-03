import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { OrderStatus } from '@prisma/client';
import { MenuItem } from '../../restaurants/entities/restaurant.entity';

// Register OrderStatus enum for GraphQL
registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'The status of an order',
});

@ObjectType()
export class OrderItem {
  @Field(() => ID)
  id: string;

  @Field()
  quantity: number;

  @Field(() => Float)
  price: number;

  @Field()
  menuItemId: string;

  @Field(() => MenuItem, { nullable: true })
  menuItem?: MenuItem;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class Order {
  @Field(() => ID)
  id: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Float)
  totalPrice: number;

  @Field()
  userId: string;

  @Field(() => [OrderItem])
  items: OrderItem[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
