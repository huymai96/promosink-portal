import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <SearchBar />
        </div>
        {children}
      </div>
    </div>
  );
}

