import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bizpartner.al' },
    update: {},
    create: {
      email: 'admin@bizpartner.al',
      password: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isVerified: true,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Demo publisher
  const publisherPassword = await bcrypt.hash('Publisher@1234', 12);
  const publisher = await prisma.user.upsert({
    where: { email: 'publisher@bizpartner.al' },
    update: {},
    create: {
      email: 'publisher@bizpartner.al',
      password: publisherPassword,
      firstName: 'Demo',
      lastName: 'Publisher',
      role: 'PUBLISHER',
      isVerified: true,
      isEmailVerified: true,
      isActive: true,
      company: 'TechAlbania',
    },
  });
  console.log('✅ Publisher user created:', publisher.email);

  // Categories
  const jobCategories = [
    { name: 'Technology', slug: 'technology', icon: '💻' },
    { name: 'Finance', slug: 'finance', icon: '💰' },
    { name: 'Healthcare', slug: 'healthcare', icon: '🏥' },
    { name: 'Education', slug: 'education', icon: '📚' },
    { name: 'Design', slug: 'design', icon: '🎨' },
    { name: 'Marketing', slug: 'marketing', icon: '📣' },
    { name: 'Engineering', slug: 'engineering', icon: '⚙️' },
    { name: 'Sales', slug: 'sales', icon: '📊' },
  ];

  const propertyCategories = [
    { name: 'Apartments', slug: 'apartments', icon: '🏢' },
    { name: 'Houses', slug: 'houses', icon: '🏠' },
    { name: 'Villas', slug: 'villas', icon: '🏰' },
    { name: 'Offices', slug: 'offices', icon: '🏗️' },
    { name: 'Land', slug: 'land', icon: '🌿' },
    { name: 'Commercial', slug: 'commercial', icon: '🏪' },
  ];

  for (const cat of jobCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, listingType: 'JOB' },
    });
  }

  for (const cat of propertyCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, listingType: 'REAL_ESTATE' },
    });
  }
  console.log('✅ Categories seeded');

  // Plans
  const plans = [
    {
      name: 'Free',
      type: 'FREE' as const,
      price: 0,
      maxListings: 3,
      featuredListings: 0,
      premiumListings: 0,
      features: { basic_support: true, standard_visibility: true },
    },
    {
      name: 'Basic',
      type: 'BASIC' as const,
      price: 9.99,
      maxListings: 15,
      featuredListings: 2,
      premiumListings: 0,
      features: { priority_support: true, enhanced_visibility: true, analytics: true },
    },
    {
      name: 'Premium',
      type: 'PREMIUM' as const,
      price: 29.99,
      maxListings: 50,
      featuredListings: 10,
      premiumListings: 5,
      features: { priority_support: true, featured_placement: true, analytics: true, badge: true, promoted: true },
    },
    {
      name: 'Enterprise',
      type: 'ENTERPRISE' as const,
      price: 99.99,
      maxListings: -1,
      featuredListings: -1,
      premiumListings: -1,
      features: { dedicated_support: true, unlimited_listings: true, api_access: true, white_label: true, custom_branding: true },
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { type: plan.type } as any,
      update: {},
      create: plan,
    });
  }
  console.log('✅ Plans seeded');

  // Sample listings
  const techCategory = await prisma.category.findUnique({ where: { slug: 'technology' } });
  const apartmentCategory = await prisma.category.findUnique({ where: { slug: 'apartments' } });

  if (techCategory) {
    await prisma.listing.create({
      data: {
        title: 'Senior Full-Stack Developer',
        slug: `senior-full-stack-developer-${Date.now()}`,
        description: 'Join our growing team as a Senior Full-Stack Developer. You will work on cutting-edge web applications using React, Node.js, and PostgreSQL.',
        type: 'JOB',
        status: 'ACTIVE',
        price: 3500,
        priceUnit: '/month',
        currency: 'EUR',
        city: 'Tirana',
        country: 'Albania',
        tags: ['react', 'nodejs', 'postgresql', 'typescript'],
        images: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800'],
        isFeatured: true,
        isPremium: true,
        publishedAt: new Date(),
        userId: publisher.id,
        categoryId: techCategory.id,
        jobDetails: {
          create: {
            jobType: 'FULL_TIME',
            experienceLevel: 'Senior',
            salaryMin: 3000,
            salaryMax: 4000,
            salaryCurrency: 'EUR',
            salaryPeriod: 'MONTHLY',
            skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
            benefits: ['Health insurance', 'Remote work', 'Stock options', 'Annual bonus'],
            requirements: ['5+ years experience', 'Strong TypeScript skills', 'Team leadership'],
            responsibilities: ['Lead development team', 'Architecture decisions', 'Code reviews'],
            openPositions: 2,
            isRemote: true,
            companyName: 'TechAlbania',
            companyWebsite: 'https://techalb.com',
          },
        },
      },
    });
  }

  if (apartmentCategory) {
    await prisma.listing.create({
      data: {
        title: 'Modern 2BR Apartment in Blloku',
        slug: `modern-2br-apartment-blloku-${Date.now()}`,
        description: 'Stunning modern 2-bedroom apartment in the heart of Blloku. Fully furnished with high-end appliances, parking included.',
        type: 'REAL_ESTATE',
        status: 'ACTIVE',
        price: 800,
        priceUnit: '/month',
        currency: 'EUR',
        city: 'Tirana',
        country: 'Albania',
        location: 'Blloku, Tirana',
        tags: ['apartment', 'modern', 'furnished', 'blloku'],
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
        isFeatured: true,
        publishedAt: new Date(),
        userId: publisher.id,
        categoryId: apartmentCategory.id,
        propertyDetails: {
          create: {
            propertyType: 'APARTMENT',
            deal: 'RENT',
            bedrooms: 2,
            bathrooms: 1,
            area: 85,
            floor: 4,
            totalFloors: 8,
            yearBuilt: 2019,
            furnished: true,
            parking: true,
            balcony: true,
            elevator: true,
            pool: false,
            gym: false,
            securitySystem: true,
            petFriendly: false,
            amenities: ['Air conditioning', 'Central heating', 'Fiber internet', 'Smart home'],
          },
        },
      },
    });
  }

  console.log('✅ Sample listings created');
  console.log('\n🎉 Seeding complete!');
  console.log('📧 Admin: admin@bizpartner.al / Admin@1234');
  console.log('📧 Publisher: publisher@bizpartner.al / Publisher@1234');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
