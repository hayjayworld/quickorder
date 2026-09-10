import { PrismaClient, UserRole, RestaurantStatus, SubscriptionStatus, OrderStatus, ThemePreset } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.orderTimeline.deleteMany();
  await prisma.orderItemOption.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.qRScan.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.productOptionValue.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.restaurantUser.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();
  await prisma.outlet.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create subscription plans
  const starterPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Starter',
      slug: 'starter',
      description: 'Perfect for small restaurants',
      priceMonthly: 0,
      maxOutlets: 1,
      maxStaff: 2,
      features: {
        QR_ORDERING: true,
        MENU_MANAGEMENT: true,
        ORDER_MANAGEMENT: true,
        BASIC_ANALYTICS: true,
        ADVANCED_ANALYTICS: false,
        MULTIPLE_STAFF: false,
        QR_ANALYTICS: false,
        CUSTOM_THEMES: false,
        PRIORITY_SUPPORT: false,
      },
      sortOrder: 1,
    },
  });

  const businessPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Business',
      slug: 'business',
      description: 'For growing restaurants',
      priceMonthly: 15000,
      maxOutlets: 3,
      maxStaff: 10,
      features: {
        QR_ORDERING: true,
        MENU_MANAGEMENT: true,
        ORDER_MANAGEMENT: true,
        BASIC_ANALYTICS: true,
        ADVANCED_ANALYTICS: true,
        MULTIPLE_STAFF: true,
        QR_ANALYTICS: true,
        CUSTOM_THEMES: true,
        PRIORITY_SUPPORT: true,
      },
      sortOrder: 2,
    },
  });

  const enterprisePlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For large restaurant chains',
      priceMonthly: 50000,
      maxOutlets: 100,
      maxStaff: 100,
      features: {
        QR_ORDERING: true,
        MENU_MANAGEMENT: true,
        ORDER_MANAGEMENT: true,
        BASIC_ANALYTICS: true,
        ADVANCED_ANALYTICS: true,
        MULTIPLE_STAFF: true,
        QR_ANALYTICS: true,
        CUSTOM_THEMES: true,
        PRIORITY_SUPPORT: true,
        CUSTOM_INTEGRATIONS: true,
        API_ACCESS: true,
        DEDICATED_SUPPORT: true,
      },
      sortOrder: 3,
    },
  });

  console.log('✅ Created subscription plans');

  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('Admin123!', 10);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@quickorder.io',
      passwordHash: superAdminPassword,
      fullName: 'Platform Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log('✅ Created super admin');

  // Create Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'The Rooftop Kitchen',
      slug: 'rooftop-kitchen',
      currency: 'NGN',
      status: RestaurantStatus.ACTIVE,
      themePreset: ThemePreset.MINIMAL,
      accentColor: '#E85D3D',
    },
  });

  // Create restaurant admin
  const adminPassword = await bcrypt.hash('Owner123!', 10);
  const restaurantAdmin = await prisma.user.create({
    data: {
      email: 'owner@rooftopkitchen.com',
      passwordHash: adminPassword,
      fullName: 'Adebayo Ogunlesi',
      phone: '+2348012345678',
      role: UserRole.RESTAURANT_ADMIN,
      isActive: true,
    },
  });

  await prisma.restaurantUser.create({
    data: {
      restaurantId: restaurant.id,
      userId: restaurantAdmin.id,
    },
  });

  // Create manager
  const managerPassword = await bcrypt.hash('Manager123!', 10);
  const manager = await prisma.user.create({
    data: {
      email: 'manager@rooftopkitchen.com',
      passwordHash: managerPassword,
      fullName: 'Chidinma Okafor',
      role: UserRole.RESTAURANT_MANAGER,
      isActive: true,
    },
  });

  await prisma.restaurantUser.create({
    data: {
      restaurantId: restaurant.id,
      userId: manager.id,
    },
  });

  // Create front desk staff
  const frontDeskPassword = await bcrypt.hash('FrontDesk123!', 10);
  const frontDesk = await prisma.user.create({
    data: {
      email: 'frontdesk@rooftopkitchen.com',
      passwordHash: frontDeskPassword,
      fullName: 'Emeka Nwosu',
      role: UserRole.FRONT_DESK,
      isActive: true,
    },
  });

  await prisma.restaurantUser.create({
    data: {
      restaurantId: restaurant.id,
      userId: frontDesk.id,
    },
  });

  console.log('✅ Created restaurant staff');

  // Create subscription
  await prisma.subscription.create({
    data: {
      restaurantId: restaurant.id,
      planId: businessPlan.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create outlets
  const ikejaOutlet = await prisma.outlet.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Ikeja Branch',
      address: '12 Allen Avenue, Ikeja, Lagos',
      phone: '+2348023456789',
      openingHours: '9:00 AM - 10:00 PM',
      status: 'ACTIVE',
    },
  });

  const lekkiOutlet = await prisma.outlet.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Lekki Branch',
      address: '45 Admiralty Way, Lekki Phase 1, Lagos',
      phone: '+2348034567890',
      openingHours: '10:00 AM - 11:00 PM',
      status: 'ACTIVE',
    },
  });

  const yabaOutlet = await prisma.outlet.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Yaba Branch',
      address: '8 Commercial Avenue, Yaba, Lagos',
      phone: '+2348045678901',
      openingHours: '8:00 AM - 9:00 PM',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created outlets');

  // Create categories
  const riceCategory = await prisma.category.create({
    data: { restaurantId: restaurant.id, name: 'Rice Dishes', sortOrder: 1 },
  });
  const burgerCategory = await prisma.category.create({
    data: { restaurantId: restaurant.id, name: 'Burgers', sortOrder: 2 },
  });
  const pastaCategory = await prisma.category.create({
    data: { restaurantId: restaurant.id, name: 'Pasta', sortOrder: 3 },
  });
  const drinksCategory = await prisma.category.create({
    data: { restaurantId: restaurant.id, name: 'Drinks', sortOrder: 4 },
  });
  const dessertCategory = await prisma.category.create({
    data: { restaurantId: restaurant.id, name: 'Desserts', sortOrder: 5 },
  });

  console.log('✅ Created categories');

  // Create products
  const jollofRice = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: riceCategory.id,
      name: 'Jollof Rice',
      description: 'Smoky Nigerian-style rice cooked in rich tomato sauce',
      price: 4500,
      preparationTime: 20,
      status: 'ACTIVE',
    },
  });

  const friedRice = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: riceCategory.id,
      name: 'Fried Rice',
      description: 'Stir-fried rice with vegetables and choice of protein',
      price: 5000,
      preparationTime: 20,
      status: 'ACTIVE',
    },
  });

  const chickenBurger = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: burgerCategory.id,
      name: 'Chicken Burger',
      description: 'Crispy chicken patty with lettuce, tomato, and special sauce',
      price: 6500,
      preparationTime: 15,
      status: 'ACTIVE',
    },
  });

  const beefBurger = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: burgerCategory.id,
      name: 'Beef Burger',
      description: 'Juicy beef patty with cheese, onions, and BBQ sauce',
      price: 7000,
      preparationTime: 15,
      status: 'ACTIVE',
    },
  });

  const pastaAlfredo = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: pastaCategory.id,
      name: 'Pasta Alfredo',
      description: 'Creamy Alfredo sauce with grilled chicken and parmesan',
      price: 6000,
      preparationTime: 18,
      status: 'ACTIVE',
    },
  });

  const coke = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: drinksCategory.id,
      name: 'Coke',
      description: 'Chilled Coca-Cola 50cl bottle',
      price: 800,
      preparationTime: 2,
      status: 'ACTIVE',
    },
  });

  const chapman = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: drinksCategory.id,
      name: 'Chapman',
      description: 'Refreshing Nigerian mocktail with bitters and citrus',
      price: 2500,
      preparationTime: 5,
      status: 'ACTIVE',
    },
  });

  const chocolateCake = await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: dessertCategory.id,
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with ganache frosting',
      price: 3500,
      preparationTime: 5,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created products');

  // Add options to Jollof Rice
  const proteinOption = await prisma.productOption.create({
    data: {
      productId: jollofRice.id,
      name: 'Choose Protein',
      isRequired: true,
      minSelections: 1,
      maxSelections: 1,
      values: {
        create: [
          { label: 'Chicken', priceDelta: 2000 },
          { label: 'Beef', priceDelta: 1500 },
          { label: 'Fish', priceDelta: 2500 },
          { label: 'No Protein', priceDelta: 0 },
        ],
      },
    },
  });

  const extraOption = await prisma.productOption.create({
    data: {
      productId: jollofRice.id,
      name: 'Extras',
      isRequired: false,
      minSelections: 0,
      maxSelections: 3,
      values: {
        create: [
          { label: 'Fried Egg', priceDelta: 500 },
          { label: 'Plantain', priceDelta: 800 },
          { label: 'Coleslaw', priceDelta: 700 },
        ],
      },
    },
  });

  console.log('✅ Created product options');

  // Create tables for Ikeja outlet
  const tables = [];
  for (let i = 1; i <= 12; i++) {
    const table = await prisma.table.create({
      data: {
        outletId: ikejaOutlet.id,
        label: `Table ${String(i).padStart(2, '0')}`,
        capacity: i <= 4 ? 2 : 4,
        location: i <= 4 ? 'Window' : i <= 8 ? 'Center' : 'Outdoor',
        status: 'AVAILABLE',
      },
    });
    tables.push(table);
  }

  // Create tables for Lekki outlet
  for (let i = 1; i <= 8; i++) {
    await prisma.table.create({
      data: {
        outletId: lekkiOutlet.id,
        label: `Table ${String(i).padStart(2, '0')}`,
        capacity: 4,
        status: 'AVAILABLE',
      },
    });
  }

  console.log('✅ Created tables');

  // Generate QR codes for Ikeja tables
  for (const table of tables) {
    await prisma.qRCode.create({
      data: {
        token: `qr_${Math.random().toString(36).slice(2, 18)}`,
        restaurantId: restaurant.id,
        outletId: ikejaOutlet.id,
        tableId: table.id,
        label: table.label,
        status: 'ACTIVE',
      },
    });
  }

  console.log('✅ Generated QR codes');

  // Create sample orders
  const orderStatuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];
  
  for (let i = 0; i < 20; i++) {
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const table = tables[Math.floor(Math.random() * tables.length)];
    const isCancelled = Math.random() < 0.1;
    
    const orderNumber = `#QO-${1042 + i}`;
    const publicToken = `ord_${Math.random().toString(36).slice(2, 18)}`;
    
    const items = [];
    const numItems = 1 + Math.floor(Math.random() * 3);
    let subtotal = 0;
    
    for (let j = 0; j < numItems; j++) {
      const products = [jollofRice, friedRice, chickenBurger, beefBurger, pastaAlfredo, coke, chapman, chocolateCake];
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = 1 + Math.floor(Math.random() * 2);
      const itemTotal = Number(product.price) * quantity;
      subtotal += itemTotal;
      
      items.push({
        productId: product.id,
        productName: product.name,
        unitPrice: Number(product.price),
        quantity,
        total: itemTotal,
      });
    }
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        publicToken,
        restaurantId: restaurant.id,
        outletId: ikejaOutlet.id,
        tableId: table.id,
        status: isCancelled ? 'CANCELLED' : status,
        orderType: 'DINE_IN',
        customerName: ['Aisha', 'Tunde', 'Ngozi', 'Kunle', 'Blessing', 'Ibrahim'][Math.floor(Math.random() * 6)],
        subtotal,
        serviceFee: 0,
        total: subtotal,
        currency: 'NGN',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)),
        items: {
          create: items,
        },
        timeline: {
          create: [
            { status: 'PENDING', notes: 'Order received' },
            ...(isCancelled
              ? [{ status: 'CANCELLED', notes: 'Order cancelled by staff' }]
              : status === 'ACCEPTED' || status === 'PREPARING' || status === 'READY' || status === 'COMPLETED'
                ? [
                    { status: 'ACCEPTED', notes: 'Order accepted' },
                    ...(status === 'PREPARING' || status === 'READY' || status === 'COMPLETED'
                      ? [{ status: 'PREPARING', notes: 'Food preparation started' }]
                      : []),
                    ...(status === 'READY' || status === 'COMPLETED'
                      ? [{ status: 'READY', notes: 'Order ready for serving' }]
                      : []),
                    ...(status === 'COMPLETED'
                      ? [{ status: 'COMPLETED', notes: 'Order completed' }]
                      : []),
                  ]
                : []),
          ],
        },
      },
    });
  }

  console.log('✅ Created sample orders');

  console.log('🎉 Seed completed successfully!');
  console.log('---');
  console.log('Login Credentials:');
  console.log('Super Admin: admin@quickorder.io / Admin123!');
  console.log('Restaurant Admin: owner@rooftopkitchen.com / Owner123!');
  console.log('Manager: manager@rooftopkitchen.com / Manager123!');
  console.log('Front Desk: frontdesk@rooftopkitchen.com / FrontDesk123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });