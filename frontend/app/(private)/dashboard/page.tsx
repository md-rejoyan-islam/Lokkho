import DashboardView from "@/components/(private)/DashboardView";

export const metadata = {
  title: "Dashboard",
  description: "আপনার চাকরির প্রস্তুতির সারসংক্ষেপ — progress, today's plan ও applications।",
};

export default function Page() {
  return <DashboardView />;
}
