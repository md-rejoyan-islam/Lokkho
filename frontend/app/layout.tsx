import { AuthProvider } from "@/lib/auth";
import { Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const hind = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lokkho — BCS, Bank, Primary & Govt Job Preparation",
    template: "%s — Lokkho",
  },
  description:
    "BCS, ব্যাংক, প্রাইমারি, রেলওয়ে সহ যেকোনো সরকারি-বেসরকারি চাকরির প্রস্তুতি এক জায়গায় — exam guide, syllabus ও mark distribution, previous year questions, important topics, study planner এবং চাকরির তালিকা।",
  keywords: [
    "BCS preparation",
    "bank job preparation",
    "govt job Bangladesh",
    "চাকরির প্রস্তুতি",
    "BCS syllabus",
    "previous year questions",
    "job circular Bangladesh",
    "primary teacher exam",
    "NTRCA",
    "railway exam",
    "bank job circular",
    "job preparation app",
  ],
  authors: [{ name: "Md Rejoyan Islam", url: "mailto:rejoyanislam0014@gmail.com" }],
  creator: "Md Rejoyan Islam",
  publisher: "Md Rejoyan Islam",
  applicationName: "Lokkho",
  category: "education",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Lokkho",
    locale: "bn_BD",
    url: SITE_URL,
    title: "Lokkho — BCS, Bank, Primary & Govt Job Preparation",
    description:
      "যেকোনো চাকরির প্রস্তুতি এক জায়গায় — exam guide, syllabus, previous year questions, study planner ও job list।",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lokkho — Job Preparation Manager",
    description:
      "BCS, Bank, Primary, Railway সহ যেকোনো চাকরির প্রস্তুতি এক জায়গায়।",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Structured data (schema.org) — helps Google understand the app & its author.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Lokkho",
  url: SITE_URL,
  applicationCategory: "EducationApplication",
  operatingSystem: "Web",
  inLanguage: "bn-BD",
  description:
    "BCS, Bank, Primary, Railway সহ যেকোনো সরকারি-বেসরকারি চাকরির প্রস্তুতি এক জায়গায় — exam guide, syllabus, previous year questions, study planner ও job list।",
  offers: { "@type": "Offer", price: "0", priceCurrency: "BDT" },
  author: {
    "@type": "Person",
    name: "Md Rejoyan Islam",
    email: "rejoyanislam0014@gmail.com",
  },
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${hind.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||((t==='system'||!t)&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
