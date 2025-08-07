'use client';

import React, { useEffect, useState } from 'react';
import type { Brand } from '@/app/models/Brand';
import { Data } from '@/app/models/Data';
import Image from 'next/image';
import { getImgUrl } from '@/app/helpers/getImgUrl';
import { Book, ChevronDown, BookOpen, FileText, Layers, Eye, EyeOff } from 'lucide-react';

const onlyBuyers = `<div className="flex items-center text-center justify-center w-full h-full">
      🚫 Only buyers can view this section 🚫
    </div>`;

function TopicsBody({
  data,
  siteInfo,
  viewContent,
}: {
  data: Data;
  siteInfo: Brand;
  viewContent: boolean;
}) {
  return (
    <div>
      {data.topics && data.topics.length > 0 && (
        <div className="topics-container p-4 page-break-avoid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.topics.map((topic, topicIndex) => (
              <div
                key={topic.id}
                className="topic bg-white rounded-lg shadow-md hover:shadow-lg p-6 transition-all duration-300 border border-gray-100"
              >
                {topic.image && topic.image.url && (
                  <div className="topic-image mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={getImgUrl({
                        id: topic?.image?.id!,
                        height: 500,
                        width: 500,
                      })}
                      height={500}
                      width={500}
                      alt={topic.image.title || 'Topic image'}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Topic {topicIndex + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
                  {topic.title}
                </h3>
                {topic.description && (
                  <div
                    className="topic-description leading-relaxed text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: viewContent ? (topic.body ?? '') : onlyBuyers,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChaptersBody({
  data,
  siteInfo,
  viewContent,
}: {
  data: Data;
  siteInfo: Brand;
  viewContent?: boolean;
}) {
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (data.chapters) {
      const estimatedPages =
        data.chapters.length +
        data.chapters.reduce((acc, chapter) => {
          return acc + (chapter.topics?.length || 0) + 1;
        }, 2); // +2 for cover and TOC
      setTotalPages(estimatedPages);
    }
  }, [data]);

  const cImg: FileType = data.images?.find((img) => img.isFeatured) ?? {};
  const chapters = data.chapters || [];
  const coverImage = getImgUrl({ id: cImg?.id!, height: 500, width: 500 });
  const bookTitle = data.title || 'Untitled Ebook';
  const bookAuthor = data?.meta?.authorName || 'Unknown Author';

  // Generate random gradient for cover if no specific design
  const gradientColors = [
    'from-purple-500 to-indigo-600',
    'from-blue-500 to-teal-400',
    'from-rose-500 to-orange-400',
    'from-amber-500 to-pink-500',
    'from-emerald-500 to-cyan-400',
  ];
  const coverGradient = gradientColors[Math.floor(Math.random() * gradientColors.length)];

  return (
    <div className="ebook-container">
      {/* Cover Page - Full page without margins */}
      <div className="book-page cover-page relative overflow-hidden h-[100vh] w-full mb-8">
        <div className={`absolute inset-0 bg-gradient-to-br ${coverGradient} opacity-90`}></div>
        {coverImage && (
          <div className="absolute inset-0 opacity-30">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${coverImage})` }}
            ></div>
          </div>
        )}
        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full p-8 text-white text-center">
          <div className="mb-8">
            <Book className="w-20 h-20" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{bookTitle}</h1>
          <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
          <h2 className="text-xl md:text-2xl mb-12">{bookAuthor}</h2>
          <div className="absolute bottom-8 w-full text-center opacity-70 mt-auto">
            <p className="text-sm">{new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="book-page toc-page bg-white rounded-lg shadow-lg p-8 m-4 min-h-screen">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 pb-4 border-b-2 border-gray-300 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          Table of Contents
        </h2>
        <div className="toc-content">
          <ol className="space-y-6">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="flex flex-col space-y-3 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700 hover:text-indigo-600 transition-colors">
                    Chapter {index + 1}: {chapter.title}
                  </span>
                  <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    Page {index + 3}
                  </span>
                </div>
                {chapter.topics && chapter.topics.length > 0 && (
                  <div className="ml-6 space-y-2">
                    {chapter.topics.map((topic, topicIndex) => (
                      <div key={topic.id} className="flex items-center gap-2 text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>{topic.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </ol>
        </div>
        <div className="page-break mt-8"></div>
      </div>

      {/* Chapter Pages */}
      {chapters.map((chapter, chapterIndex) => {
        const pageNumber = chapterIndex + 3; // Cover + TOC + 1
        const hasChapterImage = chapter.image && chapter.image.url;

        return (
          <div
            key={chapter.id}
            className="book-page chapter-page bg-white rounded-lg shadow-lg m-4 p-6"
          >
            {/* Chapter Header */}
            <div className="chapter-header mb-6">
              {hasChapterImage ? (
                <div className="chapter-image relative h-64 mb-6 overflow-hidden rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 z-10"></div>
                  <Image
                    src={getImgUrl({
                      id: chapter?.image?.id!,
                      height: 300,
                      width: 400,
                    })}
                    height={500}
                    width={500}
                    alt={chapter?.image?.title || 'Chapter image'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent z-20">
                    <h2 className="text-3xl font-bold text-white">
                      Chapter {chapterIndex + 1}: {chapter.title}
                    </h2>
                  </div>
                </div>
              ) : (
                <div className="chapter-title-header p-6 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                      <BookOpen className="w-7 h-7 text-indigo-600" />
                      Chapter {chapterIndex + 1}: {chapter.title}
                    </h2>
                    <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                      Page {pageNumber}
                    </div>
                  </div>
                </div>
              )}
              {chapter.description && (
                <div className="chapter-description p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div
                    className="prose prose-gray max-w-none"
                    dangerouslySetInnerHTML={{ __html: chapter.description }}
                  />
                </div>
              )}
            </div>

            {/* Chapter Body */}
            {chapter.body && (
              <div className="chapter-body mb-6 p-4 bg-white rounded-lg border border-gray-100">
                <div
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: viewContent ? chapter.body : onlyBuyers }}
                />
              </div>
            )}

            {/* Topics Section */}
            {chapter.topics && chapter.topics.length > 0 && (
              <div className="topics-container page-break-avoid">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-indigo-600" />
                  Chapter Topics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chapter.topics.map((topic, topicIndex) => (
                    <div
                      key={topic.id}
                      className="topic bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-300"
                    >
                      {topic.image && topic.image.url && (
                        <div className="topic-image mb-4 overflow-hidden rounded-lg">
                          <Image
                            src={getImgUrl({
                              id: topic?.image?.id!,
                              height: 500,
                              width: 500,
                            })}
                            height={500}
                            width={500}
                            alt={topic.image.title || 'Topic image'}
                            className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                        {topic.title}
                      </h3>
                      {topic.description && (
                        <div
                          className="topic-description leading-relaxed text-gray-600 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: viewContent ? (topic.body ?? '') : onlyBuyers,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubCoursesBody({
  data,
  siteInfo,
  viewContent,
}: {
  data: Data;
  siteInfo: Brand;
  viewContent: boolean;
}) {
  return (
    <div>
      {data.subCourses && data.subCourses.length > 0 && (
        <div className="subCourses-container p-4 page-break-avoid">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.subCourses.map((course: Data, index) => (
              <div
                key={course.id}
                className="course bg-white rounded-lg shadow-md hover:shadow-lg p-6 transition-all duration-300 border border-gray-100"
              >
                {course?.image && course?.image.url && (
                  <div className="course-image mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={getImgUrl({
                        id: course?.image?.id!,
                        height: 500,
                        width: 500,
                      })}
                      height={500}
                      width={500}
                      alt={course.image.title || 'Course image'}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Sub Course {index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
                  {course.title}
                </h3>
                {course.description && (
                  <div
                    className="course-description leading-relaxed text-gray-600 prose prose-sm max-w-none mb-4"
                    dangerouslySetInnerHTML={{
                      __html: viewContent ? (course.body ?? '') : onlyBuyers,
                    }}
                  />
                )}
                {course.fulFilmentType === 'chapters' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <ChaptersBody data={course} siteInfo={siteInfo} viewContent={viewContent} />
                  </div>
                )}
                {course.fulFilmentType === 'topics' && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <TopicsBody data={course} siteInfo={siteInfo} viewContent={viewContent} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main view
export default function PurchasedView({ siteInfo, data }: { siteInfo: Brand; data: Data }) {
  const { title, fulFilmentType, subCourses, chapters, topics, description } = data;
  const [selectedView, setSelectedView] = useState(fulFilmentType || 'chapters');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Available view options based on data
  const viewOptions = [];
  if (subCourses && subCourses.length > 0) {
    viewOptions.push({
      value: 'subCourses',
      label: 'Sub Courses',
      icon: Layers,
      count: subCourses.length,
    });
  }
  if (chapters && chapters.length > 0) {
    viewOptions.push({
      value: 'chapters',
      label: 'Chapters',
      icon: BookOpen,
      count: chapters.length,
    });
  }
  if (topics && topics.length > 0) {
    viewOptions.push({ value: 'topics', label: 'Topics', icon: FileText, count: topics.length });
  }

  const currentOption =
    viewOptions.find((option) => option.value === selectedView) || viewOptions[0];

  const renderContent = () => {
    switch (selectedView) {
      case 'subCourses':
        return <SubCoursesBody data={data} siteInfo={siteInfo} viewContent={showPreview} />;
      case 'chapters':
        return <ChaptersBody data={data} siteInfo={siteInfo} viewContent={showPreview} />;
      case 'topics':
        return <TopicsBody data={data} siteInfo={siteInfo} viewContent={showPreview} />;
      default:
        return <div className="text-center py-8 text-gray-500">No content available</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Book className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-sm font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500">Purchased Content</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* View Type Dropdown */}
              {viewOptions.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 min-w-[150px]"
                  >
                    {currentOption && (
                      <>
                        <currentOption.icon className="w-4 h-4" />
                        <span className="font-medium">{currentOption.label}</span>
                        <span className="bg-indigo-500 text-xs px-2 py-1 rounded-full">
                          {currentOption.count}
                        </span>
                      </>
                    )}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      {viewOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedView(option.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors duration-200 ${
                            selectedView === option.value
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-700'
                          }`}
                        >
                          <option.icon className="w-4 h-4" />
                          <span className="font-medium">{option.label}</span>
                          <span className="ml-auto bg-gray-100 text-xs px-2 py-1 rounded-full">
                            {option.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">{renderContent()}</div>

      {/* Click outside handler for dropdown */}
      {isDropdownOpen && (
        <div className="fixed inset-0 z-5" onClick={() => setIsDropdownOpen(false)} />
      )}
    </div>
  );
}
