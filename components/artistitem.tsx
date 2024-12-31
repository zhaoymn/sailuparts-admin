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
import { useRouter } from "next/navigation";
import { deleteArtist, setFeatured } from "@/lib/actions/artist.action";
import { Edit, Trash2 } from "lucide-react";

interface Artist {
  _id: string;
  name: string;
  name_chinese: string;
  birth_year: number | null;
  profile_image: string;
  featured: boolean;
}

interface ArtistComponentProps {
  artist: string;
}

const ArtistComponent: React.FC<ArtistComponentProps> = ({ artist }) => {
  const [open, setOpen] = useState(false);
  const artistData = JSON.parse(artist) as Artist;
  const router = useRouter();

  const handleDelete = async () => {
    await deleteArtist(artistData._id);
    setOpen(false);
    router.refresh();
  };

  const onModify = (id: string) => {
    router.push(`/artists/${id}`);
  };

  const handleToggleFeatured = async () => {
    if (artistData.featured) {
      // Unset featured artist
      await setFeatured(artistData._id, false);
    } else {
      // Set featured artist
      await setFeatured(artistData._id, true);
    }
    router.refresh(); // Refresh the UI to reflect the changes
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative w-24 h-24 flex-shrink-0">
        <Image
          src={artistData.profile_image}
          alt={artistData.name}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      </div>
      <div className="flex-grow">
        <h2 className="text-xl font-bold mb-1">{artistData.name}</h2>
        <p className="text-sm text-gray-600">{artistData.name_chinese}</p>
        <p className="text-xs text-gray-500">{artistData.birth_year}</p>
      </div>
      <div className="flex space-x-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={artistData.featured}
            onChange={() => {
              handleToggleFeatured();
            }}
          />
          <span>Featured</span>
        </label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onModify(artistData._id)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this artist? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ArtistComponent;
