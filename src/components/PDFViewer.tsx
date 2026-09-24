import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Download,
  Printer,
  Fullscreen,
  FullscreenExit,
  FileText,
  X,
  Search,
  MoreVertical
} from 'lucide-react';
import { Button, IconButton, Badge, Skeleton } from './ui';

// Set up PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string | File | null;
  fileName?: string;
  onClose?: () => void;
  onDownload?: () => void;
  className?: string;
}

interface ToolbarProps {
  numPages: number | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  rotation: number;
  onRotationChange: () => void;
  onDownload: () => void;
  onPrint: () => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  fileName?: string;
}

const Toolbar = ({
  numPages,
  currentPage,
  onPageChange,
  scale,
  onScaleChange,
  rotation,
  onRotationChange,
  onDownload,
  onPrint,
  isFullscreen,
  onFullscreenToggle,
  fileName,
}: ToolbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (numPages && currentPage < numPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    onScaleChange(Math.min(scale + 0.25, 3));
  };

  const handleZoomOut = () => {
    onScaleChange(Math.max(scale - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    onScaleChange(1);
  };

  const zoomOptions = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

  return (
    <div className="flex flex-wrap items-center gap-2 bg-slate-50 border-b border-slate-200 p-3">
      {/* Left Section - Navigation */}
      <div className="flex items-center gap-2">
        <IconButton
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </IconButton>
        
        <IconButton
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={!numPages || currentPage >= numPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </IconButton>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={numPages || 1}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value) || 1;
              onPageChange(Math.min(Math.max(page, 1), numPages || 1));
            }}
            className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-center text-sm"
          />
          <span className="text-slate-500 text-sm">/ {numPages || '--'}</span>
        </div>
      </div>

      {/* Center Section - File Info */}
      <div className="flex-1 flex items-center justify-center">
        {fileName && (
          <div className="flex items-center gap-2 truncate max-w-md">
            <FileText className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-sm font-medium text-slate-700 truncate">{fileName}</span>
          </div>
        )}
      </div>

      {/* Right Section - Tools */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <IconButton
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </IconButton>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            rightIcon={<ChevronDown className="h-3 w-3" />}
          >
            {Math.round(scale * 100)}%
          </Button>

          <IconButton
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </IconButton>
          
          <IconButton
            variant="ghost"
            size="sm"
            onClick={handleZoomReset}
            disabled={scale === 1}
            aria-label="Reset zoom"
          >
            <span className="text-xs font-bold">100%</span>
          </IconButton>
        </div>

        {/* Rotation */}
        <IconButton
          variant="ghost"
          size="sm"
          onClick={onRotationChange}
          aria-label="Rotate"
        >
          {rotation % 360 === 90 ? (
            <RotateCcw className="h-4 w-4" />
          ) : (
            <RotateCw className="h-4 w-4" />
          )}
        </IconButton>

        {/* Download */}
        <IconButton
          variant="ghost"
          size="sm"
          onClick={onDownload}
          aria-label="Download"
        >
          <Download className="h-4 w-4" />
        </IconButton>

        {/* Print */}
        <IconButton
          variant="ghost"
          size="sm"
          onClick={onPrint}
          aria-label="Print"
        >
          <Printer className="h-4 w-4" />
        </IconButton>

        {/* Fullscreen */}
        <IconButton
          variant="ghost"
          size="sm"
          onClick={onFullscreenToggle}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <FullscreenExit className="h-4 w-4" />
          ) : (
            <Fullscreen className="h-4 w-4" />
          )}
        </IconButton>
      </div>

      {/* Zoom Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-10 min-w-[120px]">
          {zoomOptions.map((zoom) => (
            <button
              key={zoom}
              onClick={() => {
                onScaleChange(zoom);
                setIsOpen(false);
              }}
              className={`
                w-full px-3 py-2 rounded-lg text-sm text-left
                hover:bg-slate-50 transition
                ${Math.abs(scale - zoom) < 0.01 ? 'bg-slate-100 font-bold' : ''}
              `}
            >
              {Math.round(zoom * 100)}%
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PDFViewer = ({
  url,
  fileName,
  onClose,
  onDownload,
  className = '',
}: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [renderedPages, setRenderedPages] = useState<number[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (url) {
      setIsLoading(true);
      setError(null);
      setCurrentPage(1);
      setRenderedPages([]);
    }
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
    setIsLoading(false);
    setRenderedPages([1]);
  };

  const onDocumentLoadError = (error: Error) => {
    setError(error.message);
    setIsLoading(false);
  };

  const handlePageRender = (pageNumber: number) => {
    if (!renderedPages.includes(pageNumber)) {
      setRenderedPages((prev) => [...prev, pageNumber]);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (url instanceof File) {
      const downloadUrl = URL.createObjectURL(url);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    }
  };

  const handlePrint = () => {
    if (containerRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${fileName || 'Document'}</title>
              <style>
                body { margin: 0; padding: 0; }
                iframe { width: 100%; height: 100vh; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${typeof url === 'string' ? url : URL.createObjectURL(url as File)}"></iframe>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Pre-render next few pages
    if (numPages) {
      const nextPages = Array.from({ length: Math.min(3, numPages - page) }, (_, i) => page + i + 1);
      setRenderedPages((prev) => [...new Set([...prev, page, ...nextPages])]);
    }
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
  };

  const handleRotationChange = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (error) {
    return (
      <div className={`bg-slate-50 rounded-2xl border border-slate-200 p-8 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading PDF</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className={`bg-slate-50 rounded-2xl border border-slate-200 p-8 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No PDF Selected</h3>
          <p className="text-slate-600">Please select a PDF file to view.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`
        bg-white rounded-2xl border border-slate-200 overflow-hidden
        ${isFullscreen ? 'fixed inset-0 z-50' : ''}
        ${className}
      `}
    >
      {/* Header with Toolbar */}
      <Toolbar
        numPages={numPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        scale={scale}
        onScaleChange={handleScaleChange}
        rotation={rotation}
        onRotationChange={handleRotationChange}
        onDownload={handleDownload}
        onPrint={handlePrint}
        isFullscreen={isFullscreen}
        onFullscreenToggle={toggleFullscreen}
        fileName={fileName}
      />

      {/* Main PDF Viewer */}
      <div className="relative overflow-auto" style={{ height: isFullscreen ? 'calc(100vh - 56px)' : '70vh' }}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-blue-600 mb-4 mx-auto"></div>
              <p className="text-slate-600">Loading PDF...</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0">
            {typeof url === 'string' ? (
              <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                error={null}
              >
                {Array.from({ length: numPages || 0 }, (_, i) => (
                  <div key={`page-${i + 1}`} className="relative">
                    {renderedPages.includes(i + 1) && (
                      <Page
                        pageNumber={i + 1}
                        scale={scale}
                        rotate={rotation}
                        loading={(
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                            <Skeleton className="w-full h-full" />
                          </div>
                        )}
                        error={(
                          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                            <p className="text-red-500">Error rendering page</p>
                          </div>
                        )}
                        onRenderSuccess={() => handlePageRender(i + 1)}
                      />
                    )}
                  </div>
                ))}
              </Document>
            ) : (
              <Document
                file={url as File}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                error={null}
              >
                {Array.from({ length: numPages || 0 }, (_, i) => (
                  <div key={`page-${i + 1}`} className="relative">
                    {renderedPages.includes(i + 1) && (
                      <Page
                        pageNumber={i + 1}
                        scale={scale}
                        rotate={rotation}
                        loading={(
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                            <Skeleton className="w-full h-full" />
                          </div>
                        )}
                        error={(
                          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                            <p className="text-red-500">Error rendering page</p>
                          </div>
                        )}
                        onRenderSuccess={() => handlePageRender(i + 1)}
                      />
                    )}
                  </div>
                ))}
              </Document>
            )}
          </div>
        )}

        {/* Close Button (for modal view) */}
        {onClose && !isFullscreen && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white transition"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        )}
      </div>

      {/* Page Thumbnails Sidebar (for multi-page documents) */}
      {numPages && numPages > 1 && !isFullscreen && (
        <div className="border-l border-slate-200 p-2 bg-slate-50">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1">
            {Array.from({ length: numPages }, (_, i) => (
              <button
                key={`thumb-${i + 1}`}
                onClick={() => handlePageChange(i + 1)}
                className={`
                  aspect-[3/4] rounded border-2 transition-all
                  ${currentPage === i + 1 ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-slate-300'}
                `}
                aria-label={`Go to page ${i + 1}`}
              >
                <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center text-xs text-slate-500">
                  {i + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// PDF Preview Component (Simplified version for previews)
interface PDFPreviewProps {
  url: string | File | null;
  fileName?: string;
  pages?: number;
  className?: string;
}

export const PDFPreview = ({
  url,
  fileName,
  pages = 1,
  className = '',
}: PDFPreviewProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (url) {
      setIsLoading(true);
      setError(null);
    }
  }, [url]);

  const onDocumentLoadSuccess = () => {
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    setError(error.message);
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className={`bg-slate-50 rounded-xl border border-slate-200 p-4 ${className}`}>
        <div className="text-center">
          <FileText className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-500">Error loading preview</p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className={`bg-slate-50 rounded-xl border border-slate-200 p-4 ${className}`}>
        <div className="text-center">
          <FileText className="h-6 w-6 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No preview available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-50 rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      {isLoading ? (
        <div className="aspect-[3/4] flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600"></div>
        </div>
      ) : (
        <div className="aspect-[3/4] relative">
          {typeof url === 'string' ? (
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              error={null}
            >
              <Page
                pageNumber={1}
                scale={0.3}
                loading={null}
                error={null}
              />
            </Document>
          ) : (
            <Document
              file={url as File}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              error={null}
            >
              <Page
                pageNumber={1}
                scale={0.3}
                loading={null}
                error={null}
              />
            </Document>
          )}
          
          {/* Preview Badge */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" size="sm">
              <FileText className="h-3 w-3" />
              {pages} pages
            </Badge>
          </div>
          
          {fileName && (
            <div className="absolute bottom-2 right-2">
              <span className="text-xs text-slate-500 truncate max-w-[150px] block text-right">
                {fileName}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
