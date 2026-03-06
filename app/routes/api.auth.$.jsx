// Alias route for Shopify auth under /api/auth/*
// This route is server-only; we only need loader/action.
export { loader, action } from "./auth.$";