import React from "react";
import { getHeroItems } from "@/lib/actions/heroitem.action";
import Pagination from "@/components/pagination";
import HeroItemComponent from "@/components/heroitem";
import { SearchParamsProps } from "@/types";
import Link from "next/link";

const HeroItemsPage = async ({ searchParams }: SearchParamsProps) => {
  let result;

  const pageNumber = Number(searchParams.page) || 1;
  const pageSize = 10;

  result = await getHeroItems(pageNumber, pageSize);

  if (!result || !result.items || result.items.length === 0) {
    return <div>No HeroItems Found</div>;
  }

  return (
    <div className="px-4 flex flex-col">
      <div className="flex flex-row items-center pb-4 justify-start">
        <h1 className="text-2xl font-bold text-gray-800">Hero Items</h1>
        <Link
          href="/heroitems/new"
          className="ml-4 inline-block px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700 transition duration-300"
        >
          Create New
        </Link>
      </div>
      <div className="flex flex-col">
        {result.items.map((item) => (
          <HeroItemComponent key={item.id} item={JSON.stringify(item)} />
        ))}
      </div>
      <Pagination
        pageNumber={pageNumber}
        hasNext={result.hasNext}
        totalPages={result.totalPages}
      />
    </div>
  );
};

export default HeroItemsPage;
