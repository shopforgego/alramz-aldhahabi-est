import { dbQuery } from "./db";

export type PaymentRules = {
  minAmount: number;
  maxAmount: number;
  enforceAmountLimits: boolean;
  lockPaidHours: number;
  enforcePaidLock: boolean;
  paymentsEnabled: boolean;
  enableOpenPaymentPortal: boolean;
  enableCheckoutPage: boolean;
  enableEpayPortal: boolean;
  ipVelocityPerMinute: number;
};

const DEFAULTS: PaymentRules = {
  minAmount: 50,
  maxAmount: 100000,
  enforceAmountLimits: true,
  lockPaidHours: 24,
  enforcePaidLock: true,
  paymentsEnabled: true,
  enableOpenPaymentPortal: true,
  enableCheckoutPage: true,
  enableEpayPortal: true,
  ipVelocityPerMinute: 8,
};

export async function getPaymentRules(): Promise<PaymentRules> {
  try {
    const res = await dbQuery(
      "SELECT value FROM system_settings WHERE key = 'payment_rules' LIMIT 1"
    );
    const parsed = res.rows[0]?.value || {};
    return {
      ...DEFAULTS,
      ...parsed,
      minAmount: Number(parsed.minAmount ?? DEFAULTS.minAmount),
      maxAmount: Number(parsed.maxAmount ?? DEFAULTS.maxAmount),
      enforceAmountLimits: parsed.enforceAmountLimits !== false,
      lockPaidHours: Number(parsed.lockPaidHours ?? DEFAULTS.lockPaidHours),
      enforcePaidLock: parsed.enforcePaidLock !== false,
      paymentsEnabled: parsed.paymentsEnabled !== false,
      enableOpenPaymentPortal: parsed.enableOpenPaymentPortal !== false,
      enableCheckoutPage: parsed.enableCheckoutPage !== false,
      enableEpayPortal: parsed.enableEpayPortal !== false,
      ipVelocityPerMinute: Number(parsed.ipVelocityPerMinute ?? DEFAULTS.ipVelocityPerMinute),
    };
  } catch (err) {
    console.error("settings read failed", err);
    return DEFAULTS;
  }
}
