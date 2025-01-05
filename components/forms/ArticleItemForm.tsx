"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import {
  createArticle,
  getArticleById,
  updateArticle,
} from "@/lib/actions/article.action";
import { FaImage, FaSave, FaTimes } from "react-icons/fa";
import { ImageKitProvider } from "imagekitio-next";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

const articleFormSchema = z.object({
  _id: z.string().optional(),
  article_id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  title_chinese: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  abstract: z.string().min(1, "Abstract is required"),
  date: z.string().min(1, "Date is required"),
  cover_image: z.string().min(1, "Cover image is required"),
  cover_imageId: z.string().optional(),
  markdown: z.string().min(1, "Content is required"),
});

const ArticleForm = ({ params }: { params: { id?: string } }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [originalImageId, setoriginalImageId] = React.useState<string | null>(
    null
  );
  const [isUploading, setIsUploading] = React.useState(false);

  const form = useForm<z.infer<typeof articleFormSchema>>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      _id: params.id,
      article_id: "",
      title: "",
      title_chinese: "",
      category: "",
      abstract: "",
      date: new Date().toISOString().split("T")[0],
      cover_image: "",
      cover_imageId: "",
      markdown: "",
    },
  });

  const router = useRouter();

  const { id } = params;

  useEffect(() => {
    const fetchArticle = async (id: string) => {
      try {
        const response = await getArticleById(id);
        const article = await JSON.parse(response);
        form.reset(article);
        if (article.cover_image) {
          setPreviewUrl(article.cover_image);
          setoriginalImageId(article.cover_imageId);
        }
        form.setValue("category", article.category);
      } catch (error) {
        console.error("Error fetching article:", error);
        setError("Failed to fetch article");
      }
    };

    if (id) {
      fetchArticle(id);
    }
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
      form.setValue("cover_image", objectUrl);
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
      formData.append("folder", "/articles/cover");

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

  const onSubmit = async (values: z.infer<typeof articleFormSchema>) => {
    try {
      setIsUploading(true);
      let coverImageUrl = values.cover_image;
      let coverImageId = values.cover_imageId;

      if (selectedFile) {
        if (originalImageId) {
          try {
            await deleteFromImageKit(originalImageId);
          } catch (error) {
            console.error("Error deleting cover image:", error);
          }
        }
        const uploadResult = await uploadToImageKit(selectedFile);
        coverImageUrl = uploadResult.url;
        coverImageId = uploadResult.fileId;
      }

      const updatedValues = {
        ...values,
        cover_image: coverImageUrl,
        cover_imageId: coverImageId,
      };

      if (id) {
        // Update article in the database
        await updateArticle(id, JSON.stringify(updatedValues));
      } else {
        // Create new article in the database
        await createArticle(JSON.stringify(updatedValues));
      }

      router.push("/articles");
      router.refresh();
    } catch (error) {
      console.error("Error submitting article:", error);
      setError("Failed to submit article");
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter article title" {...field} />
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
                  <FormLabel>Chinese Title</FormLabel>
                  <FormControl>
                    <Input placeholder="请在此输入中文标题" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="article_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Article ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter article ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent defaultValue={"Art Education"}>
                      <SelectItem value="Art Review">Art Review</SelectItem>
                      <SelectItem value="Art News">Art News</SelectItem>
                      <SelectItem value="Art History">Art History</SelectItem>
                      <SelectItem value="Art Events">Art Events</SelectItem>
                      <SelectItem value="Artist Introduction">
                        Artist Introduction
                      </SelectItem>
                      <SelectItem value="Art Education">
                        Art Education
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="abstract"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abstract</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter article abstract"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cover_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image</FormLabel>
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
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="rounded-lg object-cover"
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
                        Change Cover Image
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
              name="markdown"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content (Markdown)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter article content in markdown format"
                      className="resize-none min-h-[1000px]"
                      {...field}
                    />
                  </FormControl>
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
                onClick={() => router.replace("/articles")}
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

export default ArticleForm;
