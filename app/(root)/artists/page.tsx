import React from "react";
import { getArtists } from "@/lib/actions/artist.action";
import Pagination from "@/components/pagination";
import ArtistComponent from "@/components/artistitem";
import { SearchParamsProps } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Home } from "lucide-react";

const ArtistsPage = async ({ searchParams }: SearchParamsProps) => {
  const pageNumber = Number(searchParams.page) || 1;
  const pageSize = 10;

  const result = await getArtists(pageNumber, pageSize);

  if (!result || !result.artists || result.artists.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No Artists Found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Artists</h1>
        <div className="flex space-x-4">
          <Link href="/artists/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Artist
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
      <Card>
        <CardContent className="p-6 space-y-6">
          {result.artists.map((artist) => (
            <ArtistComponent key={artist._id} artist={JSON.stringify(artist)} />
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
    </div>
  );
};

export default ArtistsPage;
