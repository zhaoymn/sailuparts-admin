"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

const searchFormSchema = z.object({
  painting_id: z.string().optional(),
  artist_id: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

export default function PaintingSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      painting_id: searchParams.get("painting_id") || "",
      artist_id: searchParams.get("artist_id") || "",
    },
  });

  const onSubmit = (data: SearchFormValues) => {
    const params = new URLSearchParams();
    if (data.painting_id) params.set("painting_id", data.painting_id);
    if (data.artist_id) params.set("artist_id", data.artist_id);
    params.set("page", "1");
    router.push(`/paintings?${params.toString()}`);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="painting_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Painting ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter painting ID" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="artist_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter artist ID" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
