import React from "react";
import { getHeroItems } from "@/lib/actions/heroitem.action";
import Pagination from "@/components/pagination";
import HeroItemComponent from "@/components/heroitem";
import { SearchParamsProps } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, PlusCircle } from "lucide-react"; // Assuming you're using lucide-react for icons

const HeroItemsPage = async ({ searchParams }: SearchParamsProps) => {
  const pageNumber = Number(searchParams.page) || 1;
  const pageSize = 10;

  const result = await getHeroItems(pageNumber, pageSize);

  if (!result || !result.items || result.items.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No Hero Items Found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hero Items</h1>
        <div className="flex flex-row items-center gap-x-4">
          <Link href="/heroitems/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Item
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Back to Main Menu
            </Button>
          </Link>
        </div>
      </div>
      <div className="space-y-4">
        {result.items.map((item) => (
          <Card key={item.id} className="w-full">
            <CardContent className="p-4">
              <HeroItemComponent item={JSON.stringify(item)} />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8">
        <Pagination
          pageNumber={pageNumber}
          hasNext={result.hasNext}
          totalPages={result.totalPages}
        />
      </div>
    </div>
  );
};

export default HeroItemsPage;
