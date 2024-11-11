"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createNewPainting,
  paintingIdExists,
} from "@/lib/actions/painting.action";

export default function ModifyPaintingItemPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleConfirm = async () => {
    // Check if painting id exists (to be implemented)
    const idExists = await paintingIdExists(selectedId);
    if (idExists) {
      // Show a red line on the bottom of the input
      setErrorMessage("This painting ID already exists.");
      return;
    }
    // Handle confirm logic

    const newPaintingId = await createNewPainting(selectedId);

    router.push(`/paintings/${newPaintingId}`);
  };
  const handleCancel = () => {
    // Handle cancel logic
    router.replace("/paintings");
  };
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-slate-800">
              Create Painting Item
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="paintingInput"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Painting ID
                </label>
                <Input
                  id="paintingInput"
                  placeholder="Enter painting ID"
                  className="w-full"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                />
              </div>
              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 pt-6">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => handleCancel()}
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleConfirm()}
            >
              <Check className="h-4 w-4" />
              Confirm
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
