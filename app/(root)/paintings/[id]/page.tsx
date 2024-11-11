"use client";

import React from "react";
import PaintingItemForm from "@/components/forms/PaintingItemForm";

export default function ModifyPaintingItemPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Modify Painting Item</h1>
      <PaintingItemForm {...{ params: { id: id } }} />
    </div>
  );
}
