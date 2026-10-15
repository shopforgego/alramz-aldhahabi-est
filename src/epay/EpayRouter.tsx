import React from "react";
import { CheckoutPage } from "./CheckoutPage";
import { EpayPortal } from "./EpayPortal";
import { InvoicePage, SuccessPage } from "./ResultPages";

export function EpayRouter() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/epay/checkout") return <CheckoutPage />;
  if (path === "/epay/success") return <SuccessPage />;
  if (path === "/sa") return <InvoicePage />;
  return <EpayPortal />;
}
