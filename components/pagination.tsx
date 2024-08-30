"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { formUrlQuery } from "@/lib/utils";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Ellipsis } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  hasNext: boolean;
}

const Pagination = ({ pageNumber, totalPages, hasNext }: PaginationProps) => {
  const PageNavigatorSchema = z.number().int().min(1).max(totalPages); // Assuming a maximum of 100 pages

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const handleNavigation = (direction: string) => {
    const nextPageNumber =
      direction === "next" ? Number(pageNumber) + 1 : pageNumber - 1;
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPageNumber.toString(),
    });
    router.push(newUrl);
  };

  const handleJumpToPage = (page: number) => {
    try {
      const validatedPage = PageNavigatorSchema.parse(page);
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "page",
        value: validatedPage.toString(),
      });
      router.push(newUrl);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid Page Number",
          description: "Please enter a valid page number",
          variant: "destructive",
        });
      } else {
        console.error(error);
      }
    }
  };

  const [inputPageNumber, setInputPageNumber] = useState(0);

  return (
    <div className="flex flex-col items-center space-y-2 sm:flex sm:flex-row sm:space-y-0">
      <div className="flex w-full flex-row items-center justify-center gap-2">
        {pageNumber > 1 ? (
          <Button
            onClick={() => handleNavigation("prev")}
            className="flex min-h-[36px] items-center justify-center gap-2 border bg-black"
          >
            <p className="body-medium text-white">Prev</p>
          </Button>
        ) : (
          <Button
            disabled={true}
            className="flex min-h-[36px] items-center justify-center gap-2 border bg-white"
          >
            <p className="body-medium text-gray-400">Prev</p>
          </Button>
        )}
        {pageNumber > 2 && (
          <Button
            onClick={() => handleJumpToPage(1)}
            className="flex size-[36px] items-center justify-center gap-2 bg-white hover:bg-gray-100"
          >
            <p className="text-black">{1}</p>
          </Button>
        )}
        {pageNumber > 3 && <Ellipsis className="size-4 text-black" />}
        {pageNumber > 1 && (
          <Button
            onClick={() => handleJumpToPage(pageNumber - 1)}
            className="flex size-[36px] items-center justify-center gap-2 bg-white hover:bg-gray-100"
          >
            <p className="text-black">{pageNumber - 1}</p>
          </Button>
        )}
        <p className="flex size-[36px] items-center justify-center gap-2 rounded-md border-2 bg-white text-center text-black">
          {pageNumber}
        </p>

        {hasNext && (
          <Button
            onClick={() => handleJumpToPage(pageNumber + 1)}
            className="flex size-[36px] items-center justify-center gap-2 bg-white hover:bg-gray-100"
          >
            <p className="text-black">{pageNumber + 1}</p>
          </Button>
        )}
        {pageNumber + 2 < totalPages && (
          <Ellipsis className="size-4 text-black" />
        )}
        {pageNumber + 1 < totalPages && (
          <Button
            onClick={() => handleJumpToPage(totalPages)}
            className="flex size-[36px] items-center justify-center gap-2 bg-white hover:bg-gray-100"
          >
            <p className="text-black">{totalPages}</p>
          </Button>
        )}
        {hasNext ? (
          <Button
            onClick={() => handleNavigation("next")}
            className="btn flex min-h-[36px] items-center justify-center gap-2 border"
          >
            <p className="body-medium text-white">Next</p>
          </Button>
        ) : (
          <Button
            disabled={true}
            className="flex min-h-[36px] items-center justify-center gap-2 border bg-white"
          >
            <p className="body-medium text-gray-400">Next</p>
          </Button>
        )}
      </div>
      <div className="flex flex-row items-center gap-2">
        <p className="w-20">Jump to: </p>
        <Input
          type="number"
          min={1}
          max={totalPages}
          className="h-[40px] w-[65px] text-center"
          onChange={(e) => setInputPageNumber(Number(e.target.value))}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleJumpToPage(inputPageNumber);
            }
          }}
        />
        <Button onClick={() => handleJumpToPage(inputPageNumber)}>Go</Button>
      </div>
    </div>
  );
};

export default Pagination;
