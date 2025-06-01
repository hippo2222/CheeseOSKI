import type { LucideIcon } from 'lucide-react';

export interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  icon?: LucideIcon;
  path?: string; // For files, path to PDF or identifier
  children?: FileNode[];
  contentPreview?: string; // Short preview for search and summary input
}
