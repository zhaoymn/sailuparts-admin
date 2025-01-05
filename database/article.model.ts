import { Schema, models, model, Document } from "mongoose";

export interface IArticle extends Document {
  article_id: string;
  title: string;
  title_chinese: string;
  author: string;
  category: string;
  abstract: string;
  date: string;
  cover_image: string;
  cover_imageId: string;
  markdown: string;
}

const ArticleSchema = new Schema<IArticle>({
  article_id: { type: String, required: true },
  title: { type: String, required: true },
  title_chinese: { type: String, required: false },
  author: { type: String, required: false },
  category: { type: String, required: true },
  abstract: { type: String, required: true },
  date: { type: String, required: true },
  cover_image: { type: String, required: true },
  cover_imageId: { type: String, required: false },
  markdown: { type: String, required: true },
});

const Article = models.Article || model("Article", ArticleSchema);

export default Article;
