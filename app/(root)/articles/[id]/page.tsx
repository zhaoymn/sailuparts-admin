"use client";

import React from "react";
import ArticleItemForm from "@/components/forms/ArticleItemForm";

export default function ModifyArticleItemPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Modify Article Item</h1>
      <ArticleItemForm {...{ params: { id: id } }} />
    </div>
  );
}
