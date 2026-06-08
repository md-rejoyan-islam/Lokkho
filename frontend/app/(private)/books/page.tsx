import BooksView from "@/components/(private)/BooksView";

export const metadata = {
  title: "Books",
  description: "প্রস্তুতির জন্য recommended বইয়ের তালিকা।",
};

export default function Page() {
  return <BooksView />;
}
