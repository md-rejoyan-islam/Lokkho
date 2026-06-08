import ModuleDetailView from "@/components/(private)/ModuleDetailView";

export const metadata = {
  title: "Exam Guide",
  description: "Module-এর subject, syllabus ও mark distribution।",
};

export default function Page() {
  return <ModuleDetailView />;
}
