export const TARGET_URLS = {
  marketplace: process.env.BASE_URL || 'https://dev.workvence.com',
  admin: process.env.ADMIN_BASE_URL || 'https://admin.workvence.com',
};

export const FINANCIAL_RULES = {
  PLATFORM_FEE_PERCENTAGE: 15, // 15% platform commission
  calculatePlatformFee: (grossAmount: number): number => {
    return Number(((grossAmount * 15) / 100).toFixed(2));
  },
  calculateSellerNetPayout: (grossAmount: number): number => {
    // Seller gets 85% of gross (15% platform fee deducted)
    return Number((grossAmount - (grossAmount * 15) / 100).toFixed(2));
  },
  calculateFullBuyerRefund: (grossAmount: number): { buyerRefund: number; sellerPayout: number; platformRetained: number } => {
    return {
      buyerRefund: Number(grossAmount.toFixed(2)),
      sellerPayout: 0,
      platformRetained: 0,
    };
  },
  calculateFullSellerRelease: (grossAmount: number): { buyerRefund: number; sellerPayout: number; platformFee: number } => {
    const fee = Number(((grossAmount * 15) / 100).toFixed(2));
    const sellerPayout = Number((grossAmount - fee).toFixed(2));
    return {
      buyerRefund: 0,
      sellerPayout,
      platformFee: fee,
    };
  },
  calculateCustomSplit: (grossAmount: number, buyerRefundDollars: number): { buyerRefund: number; sellerGross: number; sellerFee: number; sellerNetPayout: number } => {
    const buyerRefund = Number(buyerRefundDollars.toFixed(2));
    const sellerGross = Number((grossAmount - buyerRefund).toFixed(2));
    const sellerFee = Number(((sellerGross * 15) / 100).toFixed(2));
    const sellerNetPayout = Number((sellerGross - sellerFee).toFixed(2));
    return {
      buyerRefund,
      sellerGross,
      sellerFee,
      sellerNetPayout,
    };
  },
};

function getRequiredEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
}

export const LIVE_ACCOUNTS = {
  get admin() {
    return {
      email: getRequiredEnv('ADMIN_EMAIL'),
      password: getRequiredEnv('ADMIN_PASSWORD'),
      username: process.env.ADMIN_USERNAME || 'admin',
      role: 'admin' as const,
    };
  },
  get seller() {
    return {
      email: getRequiredEnv('SELLER_EMAIL'),
      password: getRequiredEnv('SELLER_PASSWORD'),
      username: process.env.SELLER_USERNAME || 'seller',
      role: 'seller' as const,
      isSeller: true,
    };
  },
  get buyer() {
    return {
      email: getRequiredEnv('BUYER_EMAIL'),
      password: getRequiredEnv('BUYER_PASSWORD'),
      username: process.env.BUYER_USERNAME || 'buyer',
      role: 'buyer' as const,
      isSeller: false,
    };
  },
};

export function generateTestUserData(role: 'buyer' | 'seller') {
  const timestamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const suffix = Date.now().toString().slice(-4);
  
  return {
    firstName: 'E2E',
    lastName: role === 'seller' ? 'Seller' : 'Buyer',
    username: `wv_${role}_${timestamp}`,
    password: 'Password123!Aa',
    role,
    isSeller: role === 'seller',
    uniqueTag: `[E2E-TEST] ${role.toUpperCase()}-${suffix}`,
  };
}

export function generateSubAdminData() {
  const suffix = Date.now().toString().slice(-5);
  return {
    username: `subadmin_${suffix}`,
    email: `subadmin_${suffix}@workvence.test`,
    password: 'SubAdminPass@123!',
    roleName: 'Support Moderator',
  };
}

export function generateTestGigData(basePrice = '100') {
  const suffix = Date.now().toString().slice(-4);
  return {
    title: `[E2E-TEST] Full Stack Next.js Development Service ${suffix}`,
    updatedTitle: `[E2E-TEST] Updated Full Stack Development Service ${suffix}`,
    shortTitle: 'Full Stack Service',
    description: 'A real automated E2E test package created by Playwright with end-to-end full stack architecture.',
    shortDesc: 'Automated production package with custom full stack features.',
    deliveryTime: '3',
    price: basePrice,
    updatedPrice: String(Number(basePrice) + 10),
    tags: 'react,nextjs,typescript,api',
  };
}

export function generateTestBriefData(budget = '250') {
  const suffix = Date.now().toString().slice(-4);
  return {
    title: `[E2E-TEST] Workvence Automation Project ${suffix}`,
    description: 'This project was created automatically by the Workvence Playwright E2E test suite to validate the complete buyer seller workflow across all milestones.',
    budget,
    deadlineDays: 7,
  };
}
