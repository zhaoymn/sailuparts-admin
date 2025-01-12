"use client";
import React, { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea"; // You'll need to create/import this
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FaImage, FaSave, FaTimes } from "react-icons/fa";
import { ImageKitProvider } from "imagekitio-next";
import { Checkbox } from "@/components/ui/checkbox";
import {
  updateArtist,
  createArtist,
  getArtistById,
} from "@/lib/actions/artist.action";
import { X } from "lucide-react";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

const artistZodSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "English name is required"),
  name_chinese: z.string().min(1, "Chinese name is required"),
  birth_year: z.string().optional(),
  bio: z.string().min(1, "Biography is required"),
  bio_chinese: z.string().min(1, "Chinese biography is required"),
  awards: z.array(z.string()).default([]),
  exhibitions: z.array(z.string()).default([]),
  publications: z.array(z.string()).default([]),
  external_links: z.array(z.string()).default([]),
  external_link_names: z.array(z.string()).default([]),
  profile_image: z.string().url("Invalid image URL"),
  profile_imageId: z.string().optional(),
  featured: z.boolean().default(false),
});

const ArtistForm = ({ params }: { params: { id?: string } }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalImageId, setOriginalImageId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof artistZodSchema>>({
    resolver: zodResolver(artistZodSchema),
    defaultValues: {
      _id: params.id,
      name: "",
      name_chinese: "",
      birth_year: "",
      bio: "",
      bio_chinese: "",
      awards: [],
      exhibitions: [],
      publications: [],
      external_links: [],
      external_link_names: [],
      profile_image: "",
      profile_imageId: "",
      featured: false,
    },
  });

  const { id } = params;
  const router = useRouter();

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await getArtistById(id!);
        const artist = await JSON.parse(response);
        artist.birth_year = artist.birth_year?.toString() || "";
        form.reset(artist);
        if (artist.profile_image) {
          setPreviewUrl(artist.profile_image);
          setOriginalImageId(artist.profile_imageId);
        }
      } catch (error) {
        console.error(error);
        setError("Failed to fetch artist data");
      }
    };
    if (id) fetchArtist();
  }, [id, form]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      form.setValue("profile_image", objectUrl);
    }
  };

  const uploadToImageKit = async (file: File) => {
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
      formData.append("folder", "/artists");

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

  const onSubmit = async (values: z.infer<typeof artistZodSchema>) => {
    try {
      setIsUploading(true);
      let imageUrl = values.profile_image;
      let imageId = originalImageId;

      if (selectedFile) {
        if (originalImageId) {
          try {
            await deleteFromImageKit(originalImageId);
          } catch (error) {
            console.error("Failed to delete original image:", error);
          }
        }

        const uploadResult = await uploadToImageKit(selectedFile);
        imageUrl = uploadResult.url;
        imageId = uploadResult.fileId;
      }

      const updatedValues = {
        ...values,
        profile_image: imageUrl,
        profile_imageId: imageId,
      };

      if (id) {
        await updateArtist(id, JSON.stringify(updatedValues));
      } else {
        await createArtist(JSON.stringify(updatedValues));
      }

      router.push("/artists");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Failed to save changes");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ImageKitProvider urlEndpoint={urlEndpoint} publicKey={publicKey}>
      <div className="container mx-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>English Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter English name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name_chinese"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chinese Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Chinese name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birth_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Year</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter birth year" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography (English)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter English biography"
                      className="resize-none min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write a detailed biography of the artist in English
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio_chinese"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography (Chinese)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入艺术家的中文简介"
                      className="resize-none min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Write a detailed biography of the artist in Chinese
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="awards"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Awards</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value.map((award, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={award}
                            onChange={(e) => {
                              const newValues = [...field.value];
                              newValues[index] = e.target.value;
                              field.onChange(newValues);
                            }}
                            placeholder={`Award ${index + 1}`}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const newValues = field.value.filter(
                                (_, i) => i !== index
                              );
                              field.onChange(newValues);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => field.onChange([...field.value, ""])}
                      >
                        Add Award
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    List any awards or recognitions received by the artist
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exhibitions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exhibitions</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value.map((exhibition, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={exhibition}
                            onChange={(e) => {
                              const newValues = [...field.value];
                              newValues[index] = e.target.value;
                              field.onChange(newValues);
                            }}
                            placeholder={`Exhibition ${index + 1}`}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const newValues = field.value.filter(
                                (_, i) => i !== index
                              );
                              field.onChange(newValues);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => field.onChange([...field.value, ""])}
                      >
                        Add Exhibition
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    List any exhibitions the artist has participated in
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="publications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publications</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {field.value.map((publication, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={publication}
                            onChange={(e) => {
                              const newValues = [...field.value];
                              newValues[index] = e.target.value;
                              field.onChange(newValues);
                            }}
                            placeholder={`Publication ${index + 1}`}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              const newValues = field.value.filter(
                                (_, i) => i !== index
                              );
                              field.onChange(newValues);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => field.onChange([...field.value, ""])}
                      >
                        Add Publication
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    List any publications featuring the artist
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>External Links</FormLabel>
              <div className="space-y-2">
                {form.watch("external_links").map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`external_link_names.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} placeholder="Link Name" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`external_links.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} placeholder="Link URL" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        const newLinks = form
                          .getValues("external_links")
                          .filter((_, i) => i !== index);
                        const newNames = form
                          .getValues("external_link_names")
                          .filter((_, i) => i !== index);
                        form.setValue("external_links", newLinks);
                        form.setValue("external_link_names", newNames);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const currentLinks = form.getValues("external_links");
                    const currentNames = form.getValues("external_link_names");
                    form.setValue("external_links", [...currentLinks, ""]);
                    form.setValue("external_link_names", [...currentNames, ""]);
                  }}
                >
                  Add External Link
                </Button>
              </div>
              <FormDescription>
                Add any external links related to the artist
              </FormDescription>
              <FormMessage />
            </div>

            <FormField
              control={form.control}
              name="profile_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image</FormLabel>
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
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                      }}
                      id="featured"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel
                      htmlFor="featured"
                      className="font-medium text-sm"
                    >
                      Featured Artist
                    </FormLabel>
                    <FormDescription>
                      Select this option to feature this artist on the homepage
                    </FormDescription>
                  </div>
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
                onClick={() => router.replace("/artists")}
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

export default ArtistForm;
