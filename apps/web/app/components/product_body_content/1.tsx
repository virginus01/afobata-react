'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomCard from '@/app/widgets/custom_card';
import { Download, Printer, Book } from 'lucide-react';
import { toast } from 'sonner';
import { getImgUrl } from '@/app/helpers/getImgUrl';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function ProductBodyContent({
  data,
  siteInfo,
}: {
  data: DataType;
  siteInfo: BrandType;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const [viewContent, setViewContent] = useState(false);

  const getSearchParams = useSearchParams();

  useEffect(() => {
    const pin = getSearchParams.get('passcode');

    if (pin) {
      setViewContent(true);
    }
  }, [data.id, getSearchParams]);

  const handlePrint = useReactToPrint({
    contentRef: printRef as any,
    documentTitle: data.title || 'ebook',
    onAfterPrint: () => toast.success('Printing complete'),
    pageStyle: `
      @page {
        size: A4;
        margin: 0mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          margin: 0;
          padding: 0;
        }
        .book-page:not(.cover-page) { margin-bottom: 1rem !important; }
        .page-break { display: block; page-break-before: always; page-break-after: avoid; }
        .cover-page {
          height: 100vh !important; width: 100% !important; max-height: 100% !important;
          page-break-after: always; page-break-inside: avoid;
        }
        .toc-page, .chapter-page { padding: 10mm; page-break-before: always; page-break-after: always; }
        .topics-container, .chapter-page, img { page-break-inside: avoid; max-width: 100%; height: auto; }
      }
    `,
  });

  const handleDownloadPDF = async () => {
    if (!printRef.current) {
      toast.error('Content not ready for PDF generation');
      return;
    }

    const toastId = toast.loading('Building E-book PDF, please wait...');
    try {
      const contentElement = printRef.current;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 0;
      const pageElements = contentElement.querySelectorAll('.book-page');

      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) pdf.addPage();
        const pageElement = pageElements[i] as HTMLElement;
        const isCoverPage = pageElement.classList.contains('cover-page');

        try {
          const canvas = await html2canvas(pageElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: 1200,
            height: isCoverPage ? pageElement.offsetWidth * 1.414 : undefined,
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          const imgWidth = pdfWidth - (isCoverPage ? 0 : margin * 2);
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (isCoverPage) {
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          } else {
            const pageCount = Math.ceil(imgHeight / (pdfHeight - margin * 2));
            if (pageCount === 1) {
              pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
            } else {
              let heightLeft = imgHeight - (pdfHeight - margin * 2);
              let position = -pdfHeight + margin * 2;
              pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
              while (heightLeft > 0) {
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', margin, position + margin, imgWidth, imgHeight);
                heightLeft -= pdfHeight - margin * 2;
                position -= pdfHeight - margin * 2;
              }
            }
          }
        } catch (error) {
          console.error(`Error processing page ${i}:`, error);
          toast.error(`Error processing page ${i}, try again`);
          continue;
        }
      }

      pdf.save(`${data.title || 'My_Ebook'}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      toast.dismiss(toastId);
    }
  };

  let content;
  data.bodyType = 'topics';
  switch (data.bodyType) {
    case 'topics':
      content = <TopicsBody data={data} siteInfo={siteInfo} viewContent={viewContent} />;
      break;
    case 'chapters':
      content = <ChaptersBody data={data} siteInfo={siteInfo} viewContent={viewContent} />;
      break;
    default:
      content = <PlainBody data={data} siteInfo={siteInfo} viewContent={viewContent} />;
  }

  return (
    <div className="w-full h-full flex flex-col sm:flex-row p-2">
      <div className={`w-full ${viewContent ? 'sm:w-4/5' : ''}`}>
        <div className="w-full h-full" ref={printRef}>
          <div
            style={
              data?.bg_image?.url
                ? {
                    backgroundImage: `url(${data.bg_image.url})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                  }
                : undefined
            }
          >
            {content}
          </div>
        </div>
      </div>
      {viewContent && (
        <div className="hidden sm:block w-full sm:w-1/5 sticky top-0">
          <CustomCard title="Actions">
            <div className="flex flex-col space-y-4">
              <CustomButton
                onClick={handlePrint}
                className="h-8"
                icon={<Printer className="h-4 w-4" />}
              >
                Print Ebook
              </CustomButton>
              <CustomButton
                onClick={handleDownloadPDF}
                className="h-8"
                icon={<Download className="h-4 w-4" />}
              >
                Download PDF
              </CustomButton>
            </div>
          </CustomCard>
        </div>
      )}
    </div>
  );
}

const onlyBuyers = `<div className="flex items-center text-center justify-center w-full h-full">
      🚫 Only buyers can view this section 🚫
    </div>`;

function PlainBody({
  data,
  siteInfo,
  viewContent,
}: {
  data: DataType;
  siteInfo: BrandType;
  viewContent: boolean;
}) {
  return (
    <div>
      <div
        className="leading-relaxed text-gray-600"
        dangerouslySetInnerHTML={{ __html: viewContent ? (data.body ?? '') : onlyBuyers }}
      />
    </div>
  );
}

function TopicsBody({
  data,
  siteInfo,
  viewContent,
}: {
  data: DataType;
  siteInfo: BrandType;
  viewContent: boolean;
}) {
  return (
    <div>
      {data.topics && data.topics.length > 0 && (
        <div className="topics-container p-2 page-break-avoid">
          <div className="">
            {data.topics.map((topic, topicIndex) => (
              <div key={topic.id} className="topic  p-4 transition-all">
                {topic.image && topic.image.url && (
                  <div className="topic-image mb-4 overflow-hidden">
                    <Image
                      src={getImgUrl({
                        id: topic?.image?.id!,
                        height: 500,
                        width: 500,
                      })}
                      height={500}
                      width={500}
                      alt={topic.image.title || 'Topic image'}
                      className="w-full h-64 object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-100">
                  {topic.title}
                </h3>
                {topic.description && (
                  <div
                    className="topic-description leading-relaxed text-gray-600"
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
  data: DataType;
  siteInfo: BrandType;
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
      <div className="book-page cover-page relative overflow-hidden h-[100vh] w-full">
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
        {/* No need for explicit page-break here since CSS will force it */}
      </div>

      {/* Table of Contents */}
      <div className="book-page toc-page p-2 m-2 min-h-screen">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 pb-2 border-b border-gray-300">
          Table of Contents
        </h2>
        <div className="toc-content">
          <ol className="list-decimal list-inside space-y-4 ml-4">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="flex flex-col space-y-2 font-medium text-gray-700 hover:text-indigo-600"
              >
                <span className="flex justify-between">
                  <span>{chapter.title}</span>
                  <span className="text-gray-500">{index + 3}</span>
                </span>
                {chapter.topics && chapter.topics.length > 0 && (
                  <div className="flex flex-col list-decimal list-inside space-y-2 ml-6 mt-2">
                    {chapter.topics.map((topic) => (
                      <li key={topic.id} className="ml-4 text-gray-600">
                        {topic.title}
                      </li>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </ol>
        </div>
        {/* Forced page break for the TOC */}
        <div className="page-break"></div>
      </div>

      {/* Chapter Pages */}
      {chapters.map((chapter, chapterIndex) => {
        const pageNumber = chapterIndex + 3; // Cover + TOC + 1
        const hasChapterImage = chapter.image && chapter.image.url;

        return (
          <div key={chapter.id} className="book-page chapter-page">
            {/* Chapter Header */}
            <div className="chapter-header mb-4">
              {hasChapterImage ? (
                <div className="chapter-image relative h-64 mb-4 overflow-hidden">
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
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent z-20">
                    <h2 className="text-2xl font-bold text-white">
                      Chapter {chapterIndex + 1}: {chapter.title}
                    </h2>
                  </div>
                </div>
              ) : (
                <div className="chapter-title-header p-4 bg-gradient-to-r from-indigo-100 to-purple-100 mb-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                      Chapter {chapterIndex + 1}: {chapter.title}
                    </h2>
                    <div className="text-sm text-gray-500">Page {pageNumber}</div>
                  </div>
                </div>
              )}
              {chapter.description && (
                <div className="chapter-description p-2 border border-gray-100">
                  <div
                    className="prose text-gray-700"
                    dangerouslySetInnerHTML={{ __html: chapter.description }}
                  />
                </div>
              )}
            </div>

            {/* Chapter Body */}
            {chapter.body && (
              <div className="chapter-body mb-4  p-2">
                <div
                  className="prose text-gray-700"
                  dangerouslySetInnerHTML={{ __html: viewContent ? chapter.body : onlyBuyers }}
                />
              </div>
            )}

            {/* Topics Section */}
            {chapter.topics && chapter.topics.length > 0 && (
              <div className="topics-container p-2 page-break-avoid">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {chapter.topics.map((topic, topicIndex) => (
                    <div key={topic.id} className="topic p-4 transition-all">
                      {topic.image && topic.image.url && (
                        <div className="topic-image mb-4 overflow-hidden">
                          <Image
                            src={getImgUrl({
                              id: topic?.image?.id!,
                              height: 500,
                              width: 500,
                            })}
                            height={500}
                            width={500}
                            alt={topic.image.title || 'Topic image'}
                            className="w-full h-48 object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-100">
                        {topic.title}
                      </h3>
                      {topic.description && (
                        <div
                          className="topic-description leading-relaxed text-gray-600"
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
