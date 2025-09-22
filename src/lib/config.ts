// Application configuration
export const APP_CONFIG = {
  // Distribution method: 'even' for all decimal items adjustment, 'single' for one item adjustment
  DISTRIBUTION_METHOD: process.env.DISTRIBUTION_METHOD || 'even',
  
  // For single adjustment method, specify which item type to prefer (leave empty for automatic)
  PREFERRED_ADJUSTMENT_ITEM: process.env.PREFERRED_ADJUSTMENT_ITEM || '',
  
  // Default rates for common items
  DEFAULT_RATES: {
    'सीमेंट': 360,
    'बजरी': 1025,
    '40 एमएम कंक्रीट': 880,
    '20 एमएम कंक्रीट': 1050,
    'मिक्चर': 930,
    'वाइब्रेटर': 770,
    'पानी': 650,
    'स्टील पट्टी': 1275
  },
  
  // Items that typically don't allow decimal quantities
  NON_DECIMAL_ITEMS: ['मिक्चर', 'वाइब्रेटर', 'पानी']
} as const;
