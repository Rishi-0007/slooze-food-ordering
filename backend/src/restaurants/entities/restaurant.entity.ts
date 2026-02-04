import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Country } from '../../users/entities/user.entity';

@ObjectType()
export class Restaurant {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  countryId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Country)
  country: Country;
}

@ObjectType()
export class MenuItem {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  restaurantId: string;

  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
