import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "PathForge",
  description: "Discover your path. Build your future.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}