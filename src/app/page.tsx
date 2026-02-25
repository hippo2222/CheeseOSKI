'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { fileStructureData } from '@/data/file-structure';
import type { FileNode } from '@/types';
import FileTreeView from '@/components/mednotes/FileTreeView';
import HeaderUtilityButtons from '@/components/mednotes/HeaderUtilityButtons';
import PdfViewer from '@/components/mednotes/PdfViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { NotebookText, Search, Menu } from 'lucide-react';

export default function MedNotesHomePage() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [initialPage, setInitialPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState<string | undefined>(undefined);
  const [searchJumpToken, setSearchJumpToken] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file);
    setSearchText(undefined);
    setInitialPage(1);
  };

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  // Auto-expand folders when searching
  useEffect(() => {
    if (searchTerm.trim()) {
      const newExpanded = new Set<string>();
      const searchRecursive = (nodes: FileNode[]) => {
        nodes.forEach(node => {
          if (node.type === 'folder') {
            const childrenMatch = node.children?.some(child =>
              child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (child.type === 'folder' && child.children?.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())))
            );
            if (node.name.toLowerCase().includes(searchTerm.toLowerCase()) || childrenMatch) {
              newExpanded.add(node.id);
              if (node.children) searchRecursive(node.children);
            }
          }
        });
      };
      searchRecursive(fileStructureData);
      setExpandedFolders(newExpanded);
    }
  }, [searchTerm]);

  const filteredFileStructure = useMemo(() => {
    if (!searchTerm.trim()) {
      return fileStructureData;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();

    function rFilter(nodes: FileNode[]): FileNode[] {
      return nodes.map(node => {
        if (node.type === 'file') {
          return node.name.toLowerCase().includes(lowerSearchTerm) ? node : null;
        }
        // folder
        const filteredChildren = node.children ? rFilter(node.children) : [];
        const validChildren = filteredChildren.filter(c => c !== null) as FileNode[];

        if (node.name.toLowerCase().includes(lowerSearchTerm) || validChildren.length > 0) {
          return { ...node, children: validChildren };
        }
        return null;
      }).filter(node => node !== null) as FileNode[];
    }
    return rFilter(fileStructureData);
  }, [searchTerm]);

  const fileNodeMap = useMemo(() => {
    const map = new Map<string, FileNode>();
    function traverse(nodes: FileNode[]) {
      for (const node of nodes) {
        if (node.type === 'file' && node.path) {
          map.set(node.path, node);
        }
        if (node.children) {
          traverse(node.children);
        }
      }
    }
    traverse(fileStructureData);
    return map;
  }, []);

  // Компонент поиска по содержимому PDF
  function PdfGlobalSearch({ nodes, onFileSelect }: { nodes: FileNode[]; onFileSelect: (file: FileNode, page?: number, searchText?: string) => void }) {
    const [value, setValue] = useState('');
    const [searchResults, setSearchResults] = useState<{ path: string; preview: string; page?: number }[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const performSearch = useCallback(async (term: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setShowDropdown(true);
      try {
        const res = await fetch(`/api/pdf-search?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setIsLoading(false);
      }
    }, []);

    const handleTextSearch = useCallback((term: string) => {
      setValue(term);
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (!term.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }
      debounceTimeout.current = setTimeout(() => {
        performSearch(term);
      }, 300);
    }, [performSearch]);

    const handleResultClick = useCallback((result: { path: string; preview: string; page?: number }) => {
      setShowDropdown(false);
      setSearchResults([]);
      setValue('');
      // Используем O(1) поиск
      const file = fileNodeMap.get(result.path);
      if (file) {
        if (typeof window !== 'undefined' && (localStorage.getItem('pdfDebug') === '1' || (window as typeof window & { __PDF_DEBUG__?: boolean }).__PDF_DEBUG__)) {
          console.log('[PDFDBG] search.result.click', {
            path: result.path,
            page: result.page ?? 1,
            query: value,
            fileId: file.id,
            fileName: file.name,
          });
        }
        onFileSelect(file, result.page, value);
      }
    }, [onFileSelect, value]);

    // Функция для выделения найденного текста
    const highlightText = (text: string, query: string) => {
      if (!query.trim()) return text;
      const parts = text.split(new RegExp(`(${query})`, 'gi'));
      return parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 font-bold px-1 rounded">{part}</mark>
        ) : (
          part
        )
      );
    };

    return (
      <div className="relative flex-1 min-w-0">
        <input
          data-testid="pdf-global-search-input"
          type="text"
          value={value}
          onChange={e => handleTextSearch(e.target.value)}
          placeholder="Поиск по тексту всех PDF..."
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {showDropdown && (value.trim() !== '') && (
          <div
            ref={dropdownRef}
            data-testid="pdf-global-search-dropdown"
            className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">Поиск...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result, idx) => {
                const fileNode = fileNodeMap.get(result.path);
                return (
                  <div
                    key={result.path + idx}
                    data-testid="pdf-search-result-item"
                    onClick={() => handleResultClick(result)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="font-medium mb-1">{fileNode ? fileNode.name : result.path.split('/').pop()}</div>
                    <div className="text-sm text-gray-600">...{highlightText(result.preview, value)}...</div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">Ничего не найдено</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r shadow-md">
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-2">
              <img src="/CheeseOSKI.svg" alt="CheeseOSKI Logo" className="h-12 w-12" />
              <h1 className="text-2xl font-headline font-bold text-foreground group-data-[collapsible=icon]:hidden">
                CheeseOSKI
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="flex-1">
            <FileTreeView
              nodes={filteredFileStructure}
              onFileSelect={handleFileSelect}
              selectedFileId={selectedFile?.id}
              searchTerm={searchTerm}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col overflow-hidden bg-background">
          <header className="flex items-center gap-4 p-4 border-b bg-card shadow-sm">
            <SidebarTrigger className="md:hidden">
              <Menu />
            </SidebarTrigger>
            <HeaderUtilityButtons />
            <PdfGlobalSearch nodes={fileStructureData} onFileSelect={(file, page, text) => {
              setSelectedFile(file);
              setInitialPage(page || 1);
              setSearchText(text);
              setSearchJumpToken((t) => t + 1);
            }} />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <PdfViewer
              selectedFile={selectedFile}
              initialPage={initialPage}
              searchText={searchText}
              searchJumpToken={searchJumpToken}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
