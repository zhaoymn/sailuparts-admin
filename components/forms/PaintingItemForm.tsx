"use client";
import React, { useEffect } from "react";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FaImage, FaSave, FaTimes } from "react-icons/fa";
import {
  getPaintingById,
  removeImageFromPainting,
  addImageToPainting,
  changeImageRenderedStatus,
  updatePaintingItem,
} from "@/lib/actions/painting.action";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageKitProvider } from "imagekitio-next";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { LoadingOverlay } from "../LoadingOverlay";

import { useTransition } from "react";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

const paintingItemZodSchema = z.object({
  title: z.string().min(1, "Title is required"),
  title_chinese: z.string(),
  creation_year: z.string().min(1, "Creation year is required"),
  artist_id: z.string().min(1, "Artist ID is required"),
  artist: z.string().optional(), // ObjectId as string
  collector_id: z.string(),
  material: z.string().min(1, "Material is required"),
  material_chinese: z.string(),
  source: z.string(), // 'original' or 'collection' or 'print'
  condition: z.string(),
  available: z.boolean().default(false),
  on_hold: z.boolean().default(false),
  description: z.string().min(1, "Description is required"),
  description_chinese: z.string(),
  seal: z.string(),
  seal_chinese: z.string(),
  inscription: z.string(),
  inscription_chinese: z.string(),

  awards: z.array(z.string()).default([]),
  awards_chinese: z.array(z.string()).default([]),

  tags: z.array(z.string()).default([]),
  all_images: z.array(z.string()).default([]),
  all_imageIds: z.array(z.string()).default([]),
  all_images_150: z.array(z.string()).default([]),
  all_imageIds_150: z.array(z.string()).default([]),
  all_images_300: z.array(z.string()).default([]),
  all_imageIds_300: z.array(z.string()).default([]),
  all_images_1000: z.array(z.string()).default([]),
  all_imageIds_1000: z.array(z.string()).default([]),
  image_is_rendered: z.array(z.boolean()).default([]),

  image_height: z.number().optional(),
  image_width: z.number().optional(),
  overall_height: z.number().optional(),
  overall_width: z.number().optional(),
  is_framed: z.boolean().optional(),
  selling_price: z.number().optional(),
  mount_description: z.string().optional(),
});

interface ImageResponse {
  url: string;
  fileId: string;
}

interface ProcessedImage {
  original: ImageResponse;
  sizes: {
    [key: number]: ImageResponse;
  };
}

interface PaintingDisplay {
  url: string;
  fileId: string;
}

const PaintingItemForm = ({ params }: { params: { id: string } }) => {
  const form = useForm<z.infer<typeof paintingItemZodSchema>>({
    resolver: zodResolver(paintingItemZodSchema),
    defaultValues: {
      title: "",
      title_chinese: "",
      creation_year: "",
      artist_id: "",
      artist: "",
      collector_id: "",
      material: "",
      material_chinese: "",
      source: "original",
      condition: "",
      available: false,
      on_hold: false,
      description: "",
      description_chinese: "",
      seal: "",
      seal_chinese: "",
      inscription: "",
      inscription_chinese: "",
      awards: [],
      awards_chinese: [],
      tags: [],
      all_images: [],
      all_imageIds: [],
      all_images_150: [],
      all_imageIds_150: [],
      all_images_300: [],
      all_imageIds_300: [],
      all_images_1000: [],
      all_imageIds_1000: [],
      image_is_rendered: [],
      image_height: 0,
      image_width: 0,
      overall_height: 0,
      overall_width: 0,
      is_framed: false,
      selling_price: 0,
      mount_description: "",
    },
  });

  const { id } = params;
  const router = useRouter();
  const [paintingItem, setPaintingItem] = React.useState<any>(null);
  const [Images, setImages] = React.useState<PaintingDisplay[]>([]);
  const [paintingId, setPaintingId] = React.useState<string>("");

  const [busy, setBusy] = React.useState(true);

  const resizeImage = async (
    file: File,
    newSize: number
  ): Promise<{ blob: Blob; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const { width: originalWidth, height: originalHeight } = img;
        let newWidth: number;
        let newHeight: number;

        // Calculate new dimensions maintaining aspect ratio
        if (originalHeight > originalWidth) {
          newHeight = newSize;
          newWidth = Math.floor((originalWidth * newSize) / originalHeight);
        } else {
          newWidth = newSize;
          newHeight = Math.floor((originalHeight * newSize) / originalWidth);
        }

        // Create canvas and resize
        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Use better quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob"));
              return;
            }
            resolve({
              blob,
              width: newWidth,
              height: newHeight,
            });
          },
          "image/jpeg",
          0.9 // Quality setting (0-1)
        );

        // Clean up
        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Failed to load image"));
      };
    });
  };

  const uploadToImageKit = async (file: File, size: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", `${file.name}`);
    formData.append("publicKey", publicKey);

    try {
      const authResponse = await fetch("/api/imagekit/auth");
      const authData = await authResponse.json();

      formData.append("signature", authData.signature);
      formData.append("token", authData.token);
      formData.append("expire", authData.expire);
      formData.append("useUniqueFileName", "true");
      if (size === "original") {
        formData.append("folder", "/paintings/full/" + paintingId);
      } else if (size === "150") {
        formData.append("folder", "/paintings/150/" + paintingId);
      } else if (size === "300") {
        formData.append("folder", "/paintings/300/" + paintingId);
      } else if (size === "1000") {
        formData.append("folder", "/paintings/1000/" + paintingId);
      }

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
      return {
        url: uploadResult.url,
        fileId: uploadResult.fileId,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const processImage = async (file: File): Promise<ProcessedImage> => {
    const sizes = [150, 300, 1000];

    try {
      // Upload original first
      const original = await uploadToImageKit(file, "original");

      // Process and upload each size
      const sizedImages: { [key: number]: ImageResponse } = {};

      for (const size of sizes) {
        // Resize image
        const { blob } = await resizeImage(file, size);

        // Convert blob to File
        const resizedFile = new File([blob], `${size}_${file.name}`, {
          type: "image/jpeg",
        });

        // Upload resized version
        const uploadResult = await uploadToImageKit(
          resizedFile,
          size.toString()
        );
        sizedImages[size] = uploadResult;
      }

      return {
        original,
        sizes: sizedImages,
      };
    } catch (error) {
      console.error("Process image error:", error);
      throw error;
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBusy(true);
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await processImage(file);

      // Now you have
      console.log("Original:", result.original.url, result.original.fileId);
      console.log("150px:", result.sizes[150].url, result.sizes[150].fileId);
      console.log("300px:", result.sizes[300].url, result.sizes[300].fileId);
      console.log("1000px:", result.sizes[1000].url, result.sizes[1000].fileId);

      await addImageToPainting(paintingId, {
        original: result.original,
        sizes: {
          "150": result.sizes[150],
          "300": result.sizes[300],
          "1000": result.sizes[1000],
        },
      });

      // Wrap router.refresh() in startTransition
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setBusy(false);
    }

    window.location.reload();
  };

  const handleRemoveImage = async (index: number, url: string) => {
    setBusy(true);
    try {
      await removeImageFromPainting(paintingId, url);
    } catch (error) {
      console.error("Error removing image:", error);
    } finally {
      // Wrap router.refresh() in startTransition
      setBusy(false);
    }

    window.location.reload();
  };

  useEffect(() => {
    const fetchPaintingItem = async () => {
      setBusy(true);
      try {
        const paintingItemString = await getPaintingById(id);
        if (!paintingItemString) {
          return;
        }
        const paintingInfo = JSON.parse(paintingItemString);
        setPaintingItem(paintingInfo);
        setImages(
          paintingInfo.all_images.map((url: string, index: number) => ({
            url,
            fileId: paintingInfo.all_imageIds[index],
          }))
        );
        setPaintingId(paintingInfo.painting_id);
        form.reset(paintingInfo);
      } catch (error) {
        console.error(error);
      } finally {
        setBusy(false);
      }
    };
    if (id) fetchPaintingItem();
  }, [id, form]);

  const handleCheckboxChange = async (value: boolean, index: number) => {
    setBusy(true);
    const newImageIsRendered = [...form.getValues().image_is_rendered];
    try {
      await changeImageRenderedStatus(value, index, paintingId);
      newImageIsRendered[index] = value;
      form.setValue("image_is_rendered", newImageIsRendered);
    } catch (error) {
      console.error("Error changing image rendered status:", error);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof paintingItemZodSchema>) => {
    setBusy(true);
    try {
      const validatedValues = paintingItemZodSchema.parse(values);
      const validatedValuesString = JSON.stringify(validatedValues);
      console.log(validatedValuesString);

      await updatePaintingItem(paintingId, validatedValuesString);
      router.replace("/paintings");
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(error.errors);
      } else {
        console.error(error);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
      {busy && <LoadingOverlay />}
      <div className="container mx-auto p-4">
        <p className="text-lg text-gray-600 mb-4">paintingId: {paintingId}</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <FormField
                control={form.control}
                name="artist_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter artist ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collector_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collector ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter collector ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter painting title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title_chinese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title (Chinese)</FormLabel>
                    <FormControl>
                      <Input placeholder="输入画作标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="creation_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Creation Year</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter creation year" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Material Information */}
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter material" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="material_chinese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material (Chinese)</FormLabel>
                    <FormControl>
                      <Input placeholder="输入材料" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Source and Condition */}
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="original">Original</SelectItem>
                        <SelectItem value="collection">Collection</SelectItem>
                        <SelectItem value="print">Print</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter condition" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Seal and Inscription */}
              <FormField
                control={form.control}
                name="seal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seal (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter seal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seal_chinese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seal (Chinese)</FormLabel>
                    <FormControl>
                      <Input placeholder="输入印章" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inscription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscription (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter inscription" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inscription_chinese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscription (Chinese)</FormLabel>
                    <FormControl>
                      <Input placeholder="输入题字" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Measurements and Price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="image_height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Height</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Width</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overall_height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Height</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="overall_width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Width</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="selling_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Available</FormLabel>
                      <FormDescription>
                        Check if the painting is available
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="on_hold"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>On Hold</FormLabel>
                      <FormDescription>
                        Check if the painting is on hold
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_framed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Framed</FormLabel>
                      <FormDescription>
                        Check if the painting is framed
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Descriptions */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (English)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description"
                      className="resize-none min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description_chinese"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Chinese)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入描述"
                      className="resize-none min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mount_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mount Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter mount description"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Awards and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="awards"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Awards (English)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter awards (comma-separated)"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((s) => s.trim())
                          )
                        }
                        value={field.value.join(", ")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="awards_chinese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Awards (Chinese)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="输入奖项（用逗号分隔）"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((s) => s.trim())
                          )
                        }
                        value={field.value.join(", ")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter tags (comma-separated)"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.split(",").map((s) => s.trim())
                          )
                        }
                        value={field.value.join(", ")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload Section */}
            <FormField
              control={form.control}
              name="all_images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                      multiple={false}
                    />
                    {!paintingItem ||
                      (paintingItem.all_images.length === 0 && (
                        <p>No images uploaded</p>
                      ))}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Images.map(({ url }, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center space-y-2"
                        >
                          <div className="relative">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="rounded-lg object-cover w-full aspect-square"
                            />
                            <Button
                              type="button"
                              onClick={() => handleRemoveImage(index, url)}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-1 rounded-full"
                            >
                              <FaTimes />
                            </Button>
                          </div>
                          <div>
                            <FormField
                              control={form.control}
                              name={`image_is_rendered.${index}`}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(value: boolean) =>
                                      handleCheckboxChange(value, index)
                                    }
                                  />
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Rendered</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <FaImage className="mr-2" />
                      Add Images
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Buttons */}
            <div className="flex space-x-4 mt-6">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                <FaSave className="mr-2" />
                Save Changes
              </Button>
              <Button
                type="button"
                onClick={() => router.replace("/paintings")}
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

export default PaintingItemForm;
