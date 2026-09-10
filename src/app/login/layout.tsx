import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrator Sign In | Xunique Labs",
  description: "Secure login for internal team workspace",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
