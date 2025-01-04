"use server";

import { connectToDatabase } from "../mongoose";

import Article, { IArticle } from "../../database/article.model";
import { revalidatePath } from "next/cache";

// Get article number
export async function getArticleNumber() {
  try {
    await connectToDatabase();
    return Article.countDocuments();
  } catch (error) {
    console.log("Error getting article number: ", error);
    throw new Error("Failed to get article count");
  }
}

// Get articles with pagination
export async function getArticles(page: number = 1, pageSize: number = 10) {
  try {
    await connectToDatabase();
    const skip = (page - 1) * pageSize;
    const items = await Article.find({})
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);
    const totalItems = await Article.countDocuments({});
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNext = totalItems > skip + items.length;
    return { items, hasNext, totalPages };
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw new Error("Failed to fetch articles");
  }
}

// Get a single article by ID
export async function getArticleById(id: string) {
  try {
    await connectToDatabase();
    const article = await Article.findById(id);
    if (!article) throw new Error("Article not found");
    console.log("article:", article);
    return JSON.stringify(article);
  } catch (error) {
    console.error("Error fetching article by id:", error);
    throw new Error("Failed to fetch article");
  }
}

// Update an article
export async function updateArticle(id: string, data: string) {
  console.log("id:", id);
  console.log("data:", data);
  try {
    await connectToDatabase();
    const articleData = JSON.parse(data) as IArticle;
    const article = await Article.findById(id);
    if (!article) throw new Error("Article not found");
    await Article.findByIdAndUpdate(id, article.set(articleData));
    revalidatePath("/articles");
    return JSON.stringify(article);
  } catch (error) {
    console.error("Error updating article:", error);
    throw new Error("Failed to update article");
  }
}

// Delete an article
export async function deleteArticle(id: string) {
  try {
    await connectToDatabase();
    const article = await Article.findById(id);
    if (!article) throw new Error("Article not found");
    await Article.findByIdAndDelete(id);
    revalidatePath("/articles");
    return JSON.stringify(article);
  } catch (error) {
    console.log("Error deleting article: ", error);
    throw new Error("Failed to delete article");
  }
}

// Create an article
export async function createArticle(data: string) {
  console.log("data:", data);
  try {
    await connectToDatabase();
    const articleData = JSON.parse(data) as IArticle;
    const article = new Article({
      article_id: articleData.article_id,
      title: articleData.title,
      category: articleData.category,
      abstract: articleData.abstract,
      date: articleData.date,
      cover_image: articleData.cover_image,
      markdown: articleData.markdown,
    });
    await article.save();
    revalidatePath("/articles");
    return JSON.stringify(article);
  } catch (error) {
    console.error("Error creating article:", error);
    throw new Error("Failed to create article");
  }
}
