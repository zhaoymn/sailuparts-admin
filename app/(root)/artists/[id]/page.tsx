"use client";

import React from "react";
import ArtistForm from "@/components/forms/ArtistItemForm";

interface ModifyArtistProps {
  params: {
    id?: string;
  };
}

const ModifyArtist = ({ params }: ModifyArtistProps) => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        {params.id ? "Edit Artist" : "Add New Artist"}
      </h1>
      <ArtistForm params={params} />
    </div>
  );
};

export default ModifyArtist;
