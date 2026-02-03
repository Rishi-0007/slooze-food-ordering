import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class PaymentMethod {
  @Field(() => ID)
  id: string;

  @Field()
  type: string; // CREDIT_CARD, DEBIT_CARD, UPI, etc.

  @Field()
  details: string; // Masked card details or UPI handle

  @Field()
  isDefault: boolean;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
