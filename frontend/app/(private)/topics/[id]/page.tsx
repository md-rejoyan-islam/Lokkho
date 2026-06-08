import TopicDetailView from "@/components/(private)/TopicDetailView";

export const metadata = {
  title: "Topic",
  description: "Topic-এর বিস্তারিত, note ও progress।",
};

export default function Page() {
  return <TopicDetailView />;
}
