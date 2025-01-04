"use client";

import React from "react";
import ArtistForm from "@/components/forms/ArticleItemForm";

const NewArticle = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Add New Article</h1>
      <ArtistForm params={{ id: "" }} />
    </div>
  );
};

export default NewArticle;
