import React from "react";
import HeroItemForm from "@/components/forms/HeroItemForm";

export default function NewHeroItemPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Hero Item</h1>
      <HeroItemForm params={{ id: "" }} />
    </div>
  );
}
