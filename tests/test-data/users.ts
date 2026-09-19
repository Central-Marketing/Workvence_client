export const LIVE_ACCOUNTS = {
  seller: {
    email: process.env.SELLER_EMAIL || 'naimekattor@gmail.com',
    password: process.env.SELLER_PASSWORD || '12345678Na@',
    username: 'naimdev',
    role: 'seller' as const,
    isSeller: true,
  },
  buyer: {
    email: process.env.BUYER_EMAIL || 'naim.coder@gmail.com',
    password: process.env.BUYER_PASSWORD || '12345678Na@',
    username: 'naim',
    role: 'buyer' as const,
    isSeller: false,
  }
};

export function generateTestUserData(role: 'buyer' | 'seller') {
  const timestamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const suffix = Date.now().toString().slice(-4);
  const roleChar = role === 'seller' ? 's' : 'b';
  
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

export function generateTestGigData() {
  const suffix = Date.now().toString().slice(-4);
  return {
    title: `[E2E-TEST] Full Stack Next.js Development Service ${suffix}`,
    updatedTitle: `[E2E-TEST] Updated Full Stack Development Service ${suffix}`,
    shortTitle: 'Full Stack Service',
    description: 'A real automated E2E test package created by Playwright with end-to-end full stack architecture.',
    shortDesc: 'Automated production package with custom full stack features.',
    deliveryTime: '3',
    price: '100',
    updatedPrice: '110',
    tags: 'react,nextjs,typescript,api'
  };
}

export function generateTestBriefData() {
  const suffix = Date.now().toString().slice(-4);
  return {
    title: `[E2E-TEST] Workvence Automation Project ${suffix}`,
    description: 'This project was created automatically by the Workvence Playwright E2E test suite to validate the complete buyer seller workflow across all milestones.',
    budget: '250',
    deadlineDays: 7
  };
}
