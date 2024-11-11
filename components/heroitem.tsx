"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { DialogHeader, DialogFooter } from "./ui/dialog";
import { useRouter } from "next/navigation";
import { deleteHeroItem } from "@/lib/actions/heroitem.action";
import { Edit, Trash2 } from "lucide-react";

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
  const heroItem = JSON.parse(item) as HeroItem;
  const router = useRouter();

  const handleDelete = async () => {
    await deleteHeroItem(heroItem._id);
    setOpen(false);
  };

  const onModify = (id: string) => {
    router.push(`/heroitems/${id}`);
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative w-24 h-24 flex-shrink-0">
        <Image
          src={heroItem.image}
          alt={heroItem.title}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      </div>
      <div className="flex-grow">
        <h2 className="text-xl font-bold mb-1">{heroItem.title}</h2>
        <p className="text-sm text-gray-600">
          {heroItem.artist_name} ({heroItem.artist_name_chinese})
        </p>
        <p className="text-xs text-gray-500">ID: {heroItem.painting_id}</p>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onModify(heroItem._id)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button variant="outline" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Hero Item</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Are you sure you want to delete this hero item?
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default HeroItemComponent;
