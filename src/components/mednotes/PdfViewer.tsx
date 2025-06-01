'use client';

import React from 'react';
import type { FileNode } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Устанавливаем workerSrc для react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfViewerProps {
  selectedFile: FileNode | null;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ selectedFile }) => {
  const [numPages, setNumPages] = React.useState<number>(0);

  if (!selectedFile) {
    return (
      <Card className="h-full flex items-center justify-center shadow-lg">
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground p-8">Select a file to view its content.</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedFile.type === 'folder' || !selectedFile.path) {
    return (
      <Card className="h-full flex items-center justify-center shadow-lg">
        <CardContent className="text-center p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <p className="text-lg text-destructive-foreground">Cannot display this item.</p>
          <p className="text-sm text-muted-foreground">This is a folder or the file path is missing.</p>
        </CardContent>
      </Card>
    );
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <Card className="h-full flex flex-col shadow-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="font-headline text-2xl truncate">{selectedFile.name}</CardTitle>
        {/* <CardDescription>Path: {selectedFile.path}</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-1 p-0 relative overflow-auto max-h-[80vh] w-full flex justify-center">
        <Document
          file={selectedFile.path}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="p-8 text-center">Загрузка PDF...</div>}
          error={<div className="p-8 text-center text-destructive">Ошибка загрузки PDF</div>}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={800}
            />
          ))}
        </Document>
      </CardContent>
    </Card>
  );
};

export default PdfViewer;

