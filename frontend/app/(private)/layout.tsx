import AppShell from "@/components/(private)/AppShell";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function PrivateLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
