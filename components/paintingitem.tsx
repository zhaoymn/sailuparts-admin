"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";

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
import { useRouter } from "next/navigation";
import {
  copyPainting,
  deletePainting,
  paintingIdExists,
  setFeatured,
  setHomepage,
} from "@/lib/actions/painting.action";
import { Edit, Trash2 } from "lucide-react";
import { Input } from "./ui/input"; // Assuming you have an Input component in the ui folder

interface Painting {
  _id: string;
  title: string;
  title_chinese: string;
  artist: string;
  year: number;
  medium: string;
  image: string;
  painting_id: string;
  featured: boolean;
  homepage: boolean;
}

interface PaintingComponentProps {
  painting: string;
}

const PaintingComponent: React.FC<PaintingComponentProps> = ({ painting }) => {
  const [open, setOpen] = useState(false);
  const paintingData = JSON.parse(painting) as Painting;
  const router = useRouter();
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyId, setCopyId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDelete = async () => {
    await deletePainting(paintingData._id);
    setOpen(false);
  };

  const onModify = (id: string) => {
    router.push(`/paintings/${id}`);
  };

  const handleCopy = async () => {
    // Check if painting id exists (to be implemented)
    const idExists = await paintingIdExists(copyId);
    if (idExists) {
      // Show a red line on the bottom of the input
      document.getElementById("copyId")?.classList.add("border-red-500");
      setErrorMessage("This painting ID already exists.");
      return;
    }

    const newPaintingId = await copyPainting(paintingData._id, copyId);

    router.push(`/paintings/${newPaintingId}`);
    setCopyOpen(false);
  };

  const handleToggleFeatured = async () => {
    if (paintingData.featured) {
      // Unset featured painting
      await setFeatured(paintingData._id, false);
    } else {
      // Set featured painting
      await setFeatured(paintingData._id, true);
    }

    router.refresh(); // Refresh the UI to reflect the changes
  };

  const handleToggleHomepage = async () => {
    console.log("test");
    console.log("paintingData.homepage", paintingData.homepage);
    if (paintingData.homepage) {
      // Unset homepage painting
      await setHomepage(paintingData._id, false);
    } else {
      // Set homepage painting
      await setHomepage(paintingData._id, true);
    }

    router.refresh(); // Refresh the UI to reflect the changes
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative w-24 h-24 flex-shrink-0">
        <Image
          src={paintingData.image}
          alt={paintingData.title}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      </div>
      <div className="flex-grow">
        <h2 className="text-xl font-bold mb-1">{paintingData.title}</h2>
        <p className="text-sm text-gray-600">{paintingData.title_chinese}</p>
        <p className="text-xs text-gray-500">ID: {paintingData.painting_id}</p>
        <p className="text-sm text-gray-600">Artist: {paintingData.artist}</p>
        <p className="text-xs text-gray-500">
          Year: {paintingData.year}, Medium: {paintingData.medium}
        </p>
      </div>
      <div className="flex space-x-2 items-center">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={paintingData.featured}
            onChange={() => {
              handleToggleFeatured();
            }}
            className="form-checkbox"
          />
          Featured
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={paintingData.homepage}
            onChange={() => {
              handleToggleHomepage();
            }}
            className="form-checkbox"
          />
          <span>Homepage</span>
        </label>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onModify(paintingData._id)}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>
      <div>
        <Button variant="outline" size="sm" onClick={() => setCopyOpen(true)}>
          Copy
        </Button>
        <AlertDialog open={copyOpen} onOpenChange={setCopyOpen}>
          <AlertDialogTrigger asChild>
            <div />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Copy Painting</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Please enter the painting ID to copy:
              <label
                htmlFor="copyId"
                className="block text-sm font-medium text-gray-700"
              >
                Painting ID
              </label>
              <Input
                id="copyId"
                type="text"
                value={copyId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCopyId(e.target.value)
                }
                placeholder="Enter painting ID"
                className="mt-2 p-2 border rounded-md w-full"
              />
              {errorMessage && (
                <p className="text-red-500 text-xs mt-2">{errorMessage}</p>
              )}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button onClick={handleCopy}>Confirm</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Painting</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this painting?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaintingComponent;
