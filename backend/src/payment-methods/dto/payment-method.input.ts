import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class CreatePaymentMethodInput {
  @Field()
  @IsNotEmpty()
  type: string; // CREDIT_CARD, DEBIT_CARD, UPI

  @Field()
  @IsNotEmpty()
  details: string; // Card number (masked) or UPI handle

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  userId?: string;
}

@InputType()
export class UpdatePaymentMethodInput {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  type?: string;

  @Field({ nullable: true })
  @IsOptional()
  details?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
