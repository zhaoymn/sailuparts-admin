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
import { deleteArticle } from "@/lib/actions/article.action";
import { Edit, Trash2 } from "lucide-react";

interface Article {
  _id: string;
  title: string;
  category: string;
  abstract: string;
  date: string;
  cover_image: string;
}

interface ArticleComponentProps {
  article: string;
}

const ArticleComponent: React.FC<ArticleComponentProps> = ({ article }) => {
  const [open, setOpen] = useState(false);
  const articleData = JSON.parse(article) as Article;
  const router = useRouter();

  const handleDelete = async () => {
    await deleteArticle(articleData._id);
    setOpen(false);
    router.refresh();
  };

  const onModify = (id: string) => {
    router.push(`/articles/${id}`);
  };

  // Function to format the category string
  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Function to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative w-32 h-24 flex-shrink-0">
        <Image
          src={articleData.cover_image}
          alt={articleData.title}
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      </div>
      <div className="flex-grow">
        <h2 className="text-xl font-bold mb-1">{articleData.title}</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded">
            {formatCategory(articleData.category)}
          </span>
          <span>•</span>
          <span>{formatDate(articleData.date)}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {articleData.abstract}
        </p>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onModify(articleData._id)}
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
                Are you sure you want to delete this article? This action cannot
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

export default ArticleComponent;
