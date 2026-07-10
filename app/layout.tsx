import type { Metadata } from "next";
import AuthProvider from "./components/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "RecipePeeker",
  description: "Discover and save your favorite recipes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}