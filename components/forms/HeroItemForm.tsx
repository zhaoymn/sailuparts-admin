"use client";
import React, { use, useEffect, useState } from "react";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FaImage, FaSave, FaTimes } from "react-icons/fa";
import {
  createHeroItem,
  getHeroItemById,
  updateHeroItem,
} from "@/lib/actions/heroitem.action";
import { ImageKitProvider } from "imagekitio-next";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

const heroItemZodSchema = z.object({
  _id: z.string(),
  title: z.string().min(1, "Title is required"),
  artist_id: z.string().min(1, "Artist ID is required"),
  image: z.string().url("Invalid image URL"),
  imageId: z.string().optional(),
  painting_id: z.string().min(1, "Painting ID is required"),
});

const HeroItemForm = ({ params }: { params: { id: string } }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalImageId, setOriginalImageId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof heroItemZodSchema>>({
    resolver: zodResolver(heroItemZodSchema),
    defaultValues: {
      _id: params.id,
      title: "",
      artist_id: "",
      image: "",
      imageId: "",
      painting_id: "",
    },
  });

  const { id } = params;
  const router = useRouter();

  useEffect(() => {
    const fetchHeroItem = async () => {
      try {
        const heroItemString = await getHeroItemById(id);
        const heroItem = JSON.parse(heroItemString);
        form.reset(heroItem);
        if (heroItem.image) {
          setPreviewUrl(heroItem.image);
          setOriginalImageId(heroItem.imageId);
        }
      } catch (error) {
        console.error(error);
      }
    };
    if (id) fetchHeroItem();
  }, [id, form]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create local preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Update form image field with temporary local URL
      form.setValue("image", objectUrl);
    }
  };

  const uploadToImageKit = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", `${file.name}`);
    formData.append("publicKey", publicKey);

    try {
      // Get authentication parameters
      const authResponse = await fetch("/api/imagekit/auth");
      const authData = await authResponse.json();

      // Add required authentication parameters
      formData.append("signature", authData.signature);
      formData.append("token", authData.token);
      formData.append("expire", authData.expire);
      formData.append("useUniqueFileName", "true");
      formData.append("folder", "/website/hero_section");

      // Upload to ImageKit
      const uploadResponse = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Upload failed: ${JSON.stringify(errorData)}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log("Upload result:", uploadResult);
      return {
        url: uploadResult.url,
        fileId: uploadResult.fileId,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const deleteFromImageKit = async (fileId: string) => {
    try {
      const response = await fetch("/api/imagekit/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Delete failed: ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Delete error:", error);
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof heroItemZodSchema>) => {
    console.log("Form values:", values);
    let imageUrl = values.image;
    let imageId = originalImageId;

    try {
      setIsUploading(true);

      // If there's a selected file, upload it
      if (selectedFile) {
        // If there's an original image, you might want to delete it first
        if (originalImageId) {
          if (originalImageId == "") {
            console.log("Original image ID is empty");
          }
          console.log("Deleting original image:", originalImageId);
          try {
            await deleteFromImageKit(originalImageId);
          } catch (error) {
            console.error("Failed to delete original image:", error);
            // Continue with upload even if delete fails
          }
        }

        // Upload new image and directly assign the destructured values
        const uploadResult = await uploadToImageKit(selectedFile);
        imageUrl = uploadResult.url;
        imageId = uploadResult.fileId;
        console.log("Uploaded image:", imageUrl);
        console.log("Uploaded image ID:", imageId);
      }

      // Update the values with the new image URL
      const updatedValues = {
        ...values,
        image: imageUrl,
        imageId: imageId,
      };

      console.log("Updated values:", updatedValues);

      const validatedValues = heroItemZodSchema.parse(updatedValues);
      const validatedValuesString = JSON.stringify(validatedValues);
      // console.log(validatedValuesString);
      if (id) {
        await updateHeroItem(id, validatedValuesString);
      } else {
        await createHeroItem(validatedValuesString);
      }
      router.replace("/hero");
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(error.errors);
      } else {
        console.error(error);
      }
      setError("Failed to save changes");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
      <div className="conatiner mx-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="title">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="title" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the title of the hero item
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="artist_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="artist_id">Artist ID</FormLabel>
                  <FormControl>
                    <Input placeholder="artist id" {...field} />
                  </FormControl>
                  <FormDescription>Enter the artist ID</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                      />

                      {previewUrl && (
                        <div className="mt-2">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="rounded-lg object-cover max-w-[200px]"
                          />
                        </div>
                      )}

                      <Button
                        type="button"
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                        className="bg-green-500 hover:bg-green-600 text-white"
                        disabled={isUploading}
                      >
                        <FaImage className="mr-2" />
                        Change Image
                      </Button>

                      {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="painting_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="painting_id">Painting ID</FormLabel>
                  <FormControl>
                    <Input placeholder="painting id" {...field} />
                  </FormControl>
                  <FormDescription>Enter the painting ID</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4 mt-6">
              <Button
                type="submit"
                disabled={isUploading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <FaSave className="mr-2" />
                {isUploading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                onClick={() => router.replace("/hero")}
                className="bg-gray-500 hover:bg-gray-600"
              >
                <FaTimes className="mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ImageKitProvider>
  );
};

export default HeroItemForm;
