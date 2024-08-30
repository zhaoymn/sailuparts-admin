import HeroItemForm from "@/components/forms/HeroItemForm";

export default function ModifyHeroItemPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Modify Hero Item</h1>
      <HeroItemForm {...{ params: { id: id } }} />
    </div>
  );
}
