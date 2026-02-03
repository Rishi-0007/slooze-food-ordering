import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, Min } from 'class-validator';

@InputType()
export class AddToCartInput {
  @Field(() => ID)
  @IsUUID()
  menuItemId: string;

  @Field(() => Int, { defaultValue: 1 })
  @Min(1)
  quantity: number;
}

@InputType()
export class UpdateCartItemInput {
  @Field(() => ID)
  @IsUUID()
  orderItemId: string;

  @Field(() => Int)
  @Min(0) // 0 means remove the item
  quantity: number;
}

@InputType()
export class CheckoutInput {
  @Field(() => ID)
  @IsUUID()
  orderId: string;

  @Field(() => ID)
  @IsUUID()
  paymentMethodId: string;
}
