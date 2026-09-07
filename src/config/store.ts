import { StoreConfig } from '../types/store';

export const storeConfig: StoreConfig = {
  storeNameAr: import.meta.env.VITE_STORE_NAME_AR || "متجر الرمز الذهبي الراقي",
  storeNameEn: import.meta.env.VITE_STORE_NAME_EN || "Al Ramz Al Dhahabi Luxury",
  companyNameAr: import.meta.env.VITE_COMPANY_NAME_AR || "مؤسسة الرمز الذهبي الراقي للتجارة",
  companyNameEn: import.meta.env.VITE_COMPANY_NAME_EN || "Al Ramz Al Dhahabi Al Raqi Trading Establishment",
  taglineAr: import.meta.env.VITE_TAGLINE_AR || "التميز والفخامة في عالم الساعات والمجوهرات والإكسسوارات الفاخرة",
  taglineEn: import.meta.env.VITE_TAGLINE_EN || "Excellence & Luxury in Fine Timepieces and Jewelry",
  cr: import.meta.env.VITE_COMMERCIAL_REGISTRATION || "7055146208",
  taxNumber: import.meta.env.VITE_TAX_NUMBER || "310551462080003",
  shortAddress: import.meta.env.VITE_NATIONAL_ADDRESS_SHORT || "JHFA6854",
  city: import.meta.env.VITE_CITY || "جدة",
  district: import.meta.env.VITE_DISTRICT || "حي الفرقان",
  fullAddress: import.meta.env.VITE_FULL_ADDRESS || "المملكة العربية السعودية - جدة - حي الفرقان - الرمز البريدي JHFA6854",
  phone: import.meta.env.VITE_CONTACT_PHONE || "0555374408",
  whatsapp: import.meta.env.VITE_CONTACT_WHATSAPP || "966555374408",
  email: import.meta.env.VITE_CONTACT_EMAIL || "allhybynjwd@gmail.com",
  supportHours: import.meta.env.VITE_SUPPORT_HOURS || "السبت - الخميس: 9:00 ص - 10:00 م",
  currency: import.meta.env.VITE_CURRENCY || "SAR",
  currencySymbol: import.meta.env.VITE_CURRENCY_SYMBOL || "ر.س",
  freeShippingThreshold: Number(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD) || 200,
  shippingCost: Number(import.meta.env.VITE_SHIPPING_COST) || 25,
};
