"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { DialogHeader, DialogFooter } from "./ui/dialog";
import { useRouter } from "next/navigation";
import { deleteHeroItem } from "@/lib/actions/heroitem.action";

interface HeroItem {
  _id: string;
  title: string;
  artist_name: string;
  artist_id: string;
  artist_name_chinese: string;
  image: string;
  painting_id: string;
}

interface HeroItemComponentProps {
  item: string;
}

const HeroItemComponent: React.FC<HeroItemComponentProps> = ({ item }) => {
  const [open, setOpen] = useState(false);

  // convert item to HeroItem
  const heroItem = JSON.parse(item) as HeroItem;

  const router = useRouter();

  const handleDelete = async () => {
    //delete item here
    await deleteHeroItem(heroItem._id);
    console.log("Delete", heroItem._id);
    setOpen(false);
  };

  const onModify = (id: string) => {
    // navigate to modify page, use router
    router.push(`/heroitems/${id}`);

    console.log("Modify", id);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
      <div className="flex">
        <div className="w-1/3 relative h-64">
          <Image
            src={heroItem.image}
            alt={heroItem.title}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="w-2/3 p-6">
          <h2 className="text-2xl font-bold mb-2">{heroItem.title}</h2>
          <p className="text-gray-600 mb-1">
            Artist: {heroItem.artist_name} ({heroItem.artist_name_chinese})
          </p>
          <p className="text-gray-600 mb-4">
            Painting ID: {heroItem.painting_id}
          </p>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button onClick={() => onModify(heroItem._id)}>Modify</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                Are you sure you want to delete this item?
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                hero item.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HeroItemComponent;
