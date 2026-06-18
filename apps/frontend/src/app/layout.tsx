// apps/frontend/src/app/layout.tsx
import "./globals.css";
import Providers from '@/components/Providers'; // Adjust path if necessary to target your providers file


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
      <body>
        {/* Wrap the entire children stack so every component has wallet context */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}