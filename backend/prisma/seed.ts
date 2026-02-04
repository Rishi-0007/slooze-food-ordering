import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');
  // Clean up existing data in reverse dependency order
  console.log('🧹 Cleaning database...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();
  await prisma.country.deleteMany();
  console.log('✨ Database cleaned');

  // Create countries
  const india = await prisma.country.upsert({
    where: { code: 'IN' },
    create: { name: 'India', code: 'IN', currency: 'INR' },
    update: { currency: 'INR' },
  });

  const america = await prisma.country.upsert({
    where: { code: 'US' },
    create: { name: 'America', code: 'US', currency: 'USD' },
    update: { currency: 'USD' },
  });

  console.log('✅ Countries created');

  // Create users with hashed passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin - Nick Fury (org-wide access, no country)
  const nickFury = await prisma.user.upsert({
    where: { email: 'nick.fury@shield.com' },
    update: {
      password: hashedPassword,
      name: 'Nick Fury',
      role: Role.ADMIN,
      countryId: null,
    },
    create: {
      email: 'nick.fury@shield.com',
      password: hashedPassword,
      name: 'Nick Fury',
      role: Role.ADMIN,
      countryId: null,
    },
  });

  // Managers
  await prisma.user.upsert({
    where: { email: 'captain.marvel@shield.com' },
    update: {
      password: hashedPassword,
      name: 'Captain Marvel',
      role: Role.MANAGER,
      countryId: india.id,
    },
    create: {
      email: 'captain.marvel@shield.com',
      password: hashedPassword,
      name: 'Captain Marvel',
      role: Role.MANAGER,
      countryId: india.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'captain.america@shield.com' },
    update: {
      password: hashedPassword,
      name: 'Captain America',
      role: Role.MANAGER,
      countryId: america.id,
    },
    create: {
      email: 'captain.america@shield.com',
      password: hashedPassword,
      name: 'Captain America',
      role: Role.MANAGER,
      countryId: america.id,
    },
  });

  // Members
  await prisma.user.upsert({
    where: { email: 'thanos@shield.com' },
    update: {
      password: hashedPassword,
      name: 'Thanos',
      role: Role.MEMBER,
      countryId: india.id,
    },
    create: {
      email: 'thanos@shield.com',
      password: hashedPassword,
      name: 'Thanos',
      role: Role.MEMBER,
      countryId: india.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'thor@shield.com' },
    update: {
      password: hashedPassword,
      name: 'Thor',
      role: Role.MEMBER,
      countryId: india.id,
    },
    create: {
      email: 'thor@shield.com',
      password: hashedPassword,
      name: 'Thor',
      role: Role.MEMBER,
      countryId: india.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'travis@shield.com' },
    update: {
      password: hashedPassword,
      name: 'Travis',
      role: Role.MEMBER,
      countryId: america.id,
    },
    create: {
      email: 'travis@shield.com',
      password: hashedPassword,
      name: 'Travis',
      role: Role.MEMBER,
      countryId: america.id,
    },
  });

  console.log('✅ Users created');

  // Create payment method for Admin
  await prisma.paymentMethod.upsert({
    where: { id: 'default-payment' },
    update: {},
    create: {
      id: 'default-payment',
      type: 'CREDIT_CARD',
      details: 'any card details',
      isDefault: true,
      userId: nickFury.id,
    },
  });

  console.log('✅ Payment methods created');

  // Create Indian Restaurants
  const biryaniHouse = await prisma.restaurant.upsert({
    where: { id: 'restaurant-india-1' },
    update: {},
    create: {
      id: 'restaurant-india-1',
      name: 'Hyderabadi Biryani House',
      description: 'Authentic Hyderabadi dum biryani and kebabs',
      imageUrl:
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
      countryId: india.id,
    },
  });

  const dosaCorner = await prisma.restaurant.upsert({
    where: { id: 'restaurant-india-2' },
    update: {},
    create: {
      id: 'restaurant-india-2',
      name: 'South Indian Dosa Corner',
      description: 'Crispy dosas, idlis, and authentic South Indian meals',
      imageUrl:
        'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800',
      countryId: india.id,
    },
  });

  const punjabDhaba = await prisma.restaurant.upsert({
    where: { id: 'restaurant-india-3' },
    update: {},
    create: {
      id: 'restaurant-india-3',
      name: 'Punjab Da Dhaba',
      description: 'Rich Punjabi curries and fresh tandoori breads',
      imageUrl:
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
      countryId: india.id,
    },
  });

  // Create American Restaurants
  const burgerBarn = await prisma.restaurant.upsert({
    where: { id: 'restaurant-usa-1' },
    update: {},
    create: {
      id: 'restaurant-usa-1',
      name: 'The Burger Barn',
      description: 'Gourmet burgers with locally sourced ingredients',
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      countryId: america.id,
    },
  });

  const pizzaPalace = await prisma.restaurant.upsert({
    where: { id: 'restaurant-usa-2' },
    update: {},
    create: {
      id: 'restaurant-usa-2',
      name: 'New York Pizza Palace',
      description: 'Authentic New York style pizzas and Italian favorites',
      imageUrl:
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
      countryId: america.id,
    },
  });

  const steakHouse = await prisma.restaurant.upsert({
    where: { id: 'restaurant-usa-3' },
    update: {},
    create: {
      id: 'restaurant-usa-3',
      name: 'Texas Roadhouse Steaks',
      description: 'Premium steaks and BBQ ribs Texas style',
      imageUrl:
        'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800',
      countryId: america.id,
    },
  });

  console.log('✅ Restaurants created');

  // Menu items for all restaurants
  await prisma.menuItem.createMany({
    skipDuplicates: true,
    data: [
      // Biryani House
      {
        id: 'menu-india-1-1',
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with tender chicken',
        price: 299,
        restaurantId: biryaniHouse.id,
      },
      {
        id: 'menu-india-1-2',
        name: 'Mutton Biryani',
        description: 'Traditional mutton dum biryani',
        price: 399,
        restaurantId: biryaniHouse.id,
      },
      {
        id: 'menu-india-1-3',
        name: 'Veg Biryani',
        description: 'Mixed vegetables in fragrant rice',
        price: 249,
        restaurantId: biryaniHouse.id,
      },
      // Dosa Corner
      {
        id: 'menu-india-2-1',
        name: 'Masala Dosa',
        description: 'Crispy crepe with spiced potato filling',
        price: 129,
        restaurantId: dosaCorner.id,
      },
      {
        id: 'menu-india-2-2',
        name: 'Idli Sambar',
        description: 'Steamed rice cakes with lentil soup',
        price: 89,
        restaurantId: dosaCorner.id,
      },
      {
        id: 'menu-india-2-3',
        name: 'Filter Coffee',
        description: 'Traditional South Indian coffee',
        price: 49,
        restaurantId: dosaCorner.id,
      },
      // Punjab Dhaba
      {
        id: 'menu-india-3-1',
        name: 'Butter Chicken',
        description: 'Creamy tomato-based chicken curry',
        price: 349,
        restaurantId: punjabDhaba.id,
      },
      {
        id: 'menu-india-3-2',
        name: 'Dal Makhani',
        description: 'Slow-cooked black lentils in butter',
        price: 199,
        restaurantId: punjabDhaba.id,
      },
      {
        id: 'menu-india-3-3',
        name: 'Garlic Naan',
        description: 'Garlic-flavored tandoor bread',
        price: 49,
        restaurantId: punjabDhaba.id,
      },
      // Burger Barn
      {
        id: 'menu-usa-1-1',
        name: 'Classic Cheeseburger',
        description: 'Beef patty with cheddar and special sauce',
        price: 12.99,
        restaurantId: burgerBarn.id,
      },
      {
        id: 'menu-usa-1-2',
        name: 'Bacon BBQ Burger',
        description: 'With crispy bacon and BBQ sauce',
        price: 14.99,
        restaurantId: burgerBarn.id,
      },
      {
        id: 'menu-usa-1-3',
        name: 'Loaded Fries',
        description: 'Cheese, bacon, and jalapeños',
        price: 6.99,
        restaurantId: burgerBarn.id,
      },
      // Pizza Palace
      {
        id: 'menu-usa-2-1',
        name: 'Pepperoni Pizza',
        description: 'Classic pepperoni with mozzarella',
        price: 16.99,
        restaurantId: pizzaPalace.id,
      },
      {
        id: 'menu-usa-2-2',
        name: 'Margherita',
        description: 'Fresh tomato, mozzarella, basil',
        price: 14.99,
        restaurantId: pizzaPalace.id,
      },
      {
        id: 'menu-usa-2-3',
        name: 'Garlic Knots',
        description: 'Buttery garlic bread knots',
        price: 5.99,
        restaurantId: pizzaPalace.id,
      },
      // Steak House
      {
        id: 'menu-usa-3-1',
        name: 'Ribeye Steak',
        description: '12oz USDA Prime ribeye',
        price: 34.99,
        restaurantId: steakHouse.id,
      },
      {
        id: 'menu-usa-3-2',
        name: 'BBQ Ribs',
        description: 'Fall-off-the-bone pork ribs',
        price: 24.99,
        restaurantId: steakHouse.id,
      },
      {
        id: 'menu-usa-3-3',
        name: 'Baked Potato',
        description: 'Loaded with butter and sour cream',
        price: 6.99,
        restaurantId: steakHouse.id,
      },
    ],
  });

  console.log('✅ Menu items created');
  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Test Credentials (password: password123):');
  console.log('   Admin: nick.fury@shield.com');
  console.log('   Manager (India): captain.marvel@shield.com');
  console.log('   Manager (USA): captain.america@shield.com');
  console.log('   Member (India): thanos@shield.com, thor@shield.com');
  console.log('   Member (USA): travis@shield.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
    await prisma.$disconnect();
  });
