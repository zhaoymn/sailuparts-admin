"use client";
import React, { use, useEffect } from "react";
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
import { FaSave, FaTimes } from "react-icons/fa";
import {
  createHeroItem,
  getHeroItemById,
  updateHeroItem,
} from "@/lib/actions/heroitem.action";

const heroItemZodSchema = z.object({
  _id: z.string(),
  title: z.string().min(1, "Title is required"),
  artist_id: z.string().min(1, "Artist ID is required"),
  image: z.string().url("Invalid image URL"),
  painting_id: z.string().min(1, "Painting ID is required"),
});

const HeroItemForm = ({ params }: { params: { id: string } }) => {
  const form = useForm<z.infer<typeof heroItemZodSchema>>({
    resolver: zodResolver(heroItemZodSchema),
    defaultValues: {
      _id: params.id,
      title: "",
      artist_id: "",
      image: "",
      painting_id: "",
    },
  });

  const { id } = params;

  useEffect(() => {
    const fetchHeroItem = async () => {
      try {
        const heroItemString = await getHeroItemById(id);
        const heroItem = JSON.parse(heroItemString);
        form.reset(heroItem);
      } catch (error) {
        console.error(error);
      }
    };
    if (id) fetchHeroItem();
  }, [id, form]);

  const onSubmit = async (values: z.infer<typeof heroItemZodSchema>) => {
    try {
      const validatedValues = heroItemZodSchema.parse(values);
      const validatedValuesString = JSON.stringify(validatedValues);
      console.log(validatedValuesString);
      if (id) {
        await updateHeroItem(id, validatedValuesString);
      } else {
        await createHeroItem(validatedValuesString);
      }
      router.back();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(error.errors);
      } else {
        console.error(error);
      }
    }
  };

  const router = useRouter();

  const handleCancel = () => {
    // go back to the previous page
    router.back();
  };

  return (
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
                <FormLabel htmlFor="image">Image</FormLabel>
                <FormControl>
                  <Input placeholder="image" {...field} />
                </FormControl>
                <FormDescription>Enter the image URL</FormDescription>
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
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transform transition duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 flex items-center"
            >
              <FaSave className="inline-block mr-2" />
              Save Changes
            </Button>
            <Button
              type="button"
              className="bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 font-semibold py-2 px-6 rounded-lg shadow-sm transform transition duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75 flex items-center"
              onClick={handleCancel}
            >
              <FaTimes className="inline-block mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default HeroItemForm;
