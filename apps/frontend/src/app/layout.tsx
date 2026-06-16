// apps/frontend/src/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "AlphaRoute Terminal",
  description: "Sui Intent Optimization Matrix",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#09090b' }}>
        {children}
      </body>
    </html>
  );
}