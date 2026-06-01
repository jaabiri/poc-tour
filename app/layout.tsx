/**
 * Root layout — intentionally a pass-through.
 *
 * Both route groups own their own <html>/<body>:
 *   - (frontend)/layout.tsx  → the public site shell (fonts, globals.css)
 *   - (payload)/layout.tsx   → Payload's admin RootLayout
 *
 * If this root rendered <html>/<body> it would wrap the (payload) group too,
 * nesting Payload's <html> inside a <body> and breaking hydration.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
