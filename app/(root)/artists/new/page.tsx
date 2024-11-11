"use client";

import React from "react";
import ArtistForm from "@/components/forms/ArtistItemForm";

const ModifyArtist = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Artist</h1>
      <ArtistForm params={{ id: "" }} />
    </div>
  );
};

export default ModifyArtist;
