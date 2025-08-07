"use client";
import React, { useState } from "react";
import Image from "next/image";
import { CalendarDays, User, Share2, Bookmark, MessageSquare } from "lucide-react";
import Link from "next/link";

function ArticleDetail({ siteInfo, article }: { siteInfo: BrandType; article: PostTypes }) {
  const [likes, setLikes] = useState(1275);
  const [comments, setComments] = useState(122);

  // Mock social share functionality
  const handleShare = (platform: string) => {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Article Header */}
      <h1 className="text-2xl md:text-3xl font-bold mb-3">
        {article?.title ||
          "He Knew What He Signed Up For Trump Says To Widow Of Fallen Miami Gardens Soldier"}
      </h1>

      {/* Author and Date */}
      <div className="flex items-center mb-4">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-1 text-gray-600" />
          <span className="text-sm text-gray-600 mr-4">
            {article?.author || "Brandon Campbell"}
          </span>
        </div>
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-1 text-gray-600" />
          <span className="text-sm text-gray-600">{article?.createdAt || "Oct 18, 2023"}</span>
        </div>
      </div>

      {/* Featured Image */}
      <div className="mb-6">
        {article?.images?.[0]?.url ? (
          <Image
            src={article.images[0].url}
            alt={article.title || "Article image"}
            className="w-full h-auto object-cover"
            height={400}
            width={800}
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Image not available</span>
          </div>
        )}
      </div>

      {/* Share buttons */}
      <div className="flex items-center justify-between border-y border-gray-200 py-3 mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => handleShare("facebook")}
            className="inline-flex items-center justify-center w-8 h-8 rounded bg-blue-600 text-white"
          >
            <span className="sr-only">Share on Facebook</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
          </button>
          <button
            onClick={() => handleShare("twitter")}
            className="inline-flex items-center justify-center w-8 h-8 rounded bg-blue-400 text-white"
          >
            <span className="sr-only">Share on Twitter</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1a10.66 10.66 0 01-9-4.53s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
            </svg>
          </button>
          <button
            onClick={() => handleShare("reddit")}
            className="inline-flex items-center justify-center w-8 h-8 rounded bg-orange-600 text-white"
          >
            <span className="sr-only">Share on Reddit</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
            </svg>
          </button>
          <button
            onClick={() => handleShare("pinterest")}
            className="inline-flex items-center justify-center w-8 h-8 rounded bg-red-600 text-white"
          >
            <span className="sr-only">Share on Pinterest</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
            </svg>
          </button>
          <button
            onClick={() => handleShare("email")}
            className="inline-flex items-center justify-center w-8 h-8 rounded bg-gray-600 text-white"
          >
            <span className="sr-only">Share via Email</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <button className="text-orange-500 hover:text-orange-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </button>
            <span className="ml-1 text-sm">{likes}</span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <span className="ml-1 text-sm">{comments}</span>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="prose max-w-none">{article.body}</div>
    </div>
  );
}

export default ArticleDetail;
