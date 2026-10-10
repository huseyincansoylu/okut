// Shared by the demo seed script and the "try the demo" sign-in. Public on
// purpose (portfolio demo); override with DEMO_EMAIL / DEMO_PASSWORD.
// Not server-only: the seed script imports this outside Next.js.
export const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@dijitalmenu.app";
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "demo1234";
