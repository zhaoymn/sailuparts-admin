import React from "react";
import { getPaintings } from "@/lib/actions/painting.action";
import Pagination from "@/components/pagination";
import PaintingComponent from "@/components/paintingitem";
import { SearchParamsProps } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Home } from "lucide-react";
import PaintingSearch from "@/components/PaintingSearch";

const PaintingsPage = async ({ searchParams }: SearchParamsProps) => {
  const pageNumber = Number(searchParams.page) || 1;
  const pageSize = 10;
  const result = await getPaintings(pageNumber, pageSize, {
    painting_id: searchParams.painting_id,
    artist_id: searchParams.artist_id,
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Paintings Gallery</h1>
        <div className="flex space-x-4">
          <Link href="/paintings/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Painting
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

      <PaintingSearch />

      {!result || !result.items || result.items.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No Paintings Found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-6 space-y-6">
              {result.items.map((painting) => (
                <PaintingComponent
                  key={painting._id}
                  painting={JSON.stringify({
                    _id: painting._id,
                    title: painting.title,
                    title_chinese: painting.title_chinese,
                    artist: painting.artist_id,
                    year: painting.creation_year,
                    medium: painting.material,
                    image: painting.all_images_300[0],
                    painting_id: painting.painting_id,
                    featured: painting.featured,
                    homepage: painting.homepage,
                  })}
                />
              ))}
            </CardContent>
          </Card>
          <div className="mt-8">
            <Pagination
              pageNumber={pageNumber}
              hasNext={result.hasNext}
              totalPages={result.totalPages}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PaintingsPage;
