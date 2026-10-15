import { StoreConfig } from '../types/store';

export const storeConfig: StoreConfig = {
  storeNameAr: import.meta.env.VITE_STORE_NAME_AR || "متجر الرمز الذهبي الراقي",
  storeNameEn: import.meta.env.VITE_STORE_NAME_EN || "Al Ramz Al Dhahabi Luxury",
  companyNameAr: import.meta.env.VITE_COMPANY_NAME_AR || "مؤسسة الرمز الذهبي الراقي للتجارة",
  companyNameEn: import.meta.env.VITE_COMPANY_NAME_EN || "Al Ramz Al Dhahabi Al Raqi Trading Establishment",
  taglineAr: import.meta.env.VITE_TAGLINE_AR || "التميز والفخامة في عالم الساعات والمجوهرات والإكسسوارات الفاخرة",
  taglineEn: import.meta.env.VITE_TAGLINE_EN || "Excellence & Luxury in Fine Timepieces and Jewelry",
  currency: import.meta.env.VITE_CURRENCY || "SAR",
  currencySymbol: import.meta.env.VITE_CURRENCY_SYMBOL || "ر.س",
  freeShippingThreshold: Number(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD) || 200,
  shippingCost: Number(import.meta.env.VITE_SHIPPING_COST) || 25,
};
