'use client';

import type React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { FileNode } from '@/types';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface FileTreeItemProps {
  node: FileNode;
  onFileSelect: (file: FileNode) => void;
  selectedFileId?: string;
  searchTerm: string;
  expandedFolders: Set<string>;
  toggleFolder: (folderId: string) => void;
  level: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  onFileSelect,
  selectedFileId,
  searchTerm,
  expandedFolders,
  toggleFolder,
  level,
}) => {
  const isExpanded = expandedFolders.has(node.id);
  const IconComponent = node.icon;

  const highlightMatch = (text: string, term: string) => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === term.toLowerCase() ? (
            <span key={index} className="bg-yellow-200 text-black">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };
  
  const commonButtonClasses = "text-base py-3"; // Increased padding for larger buttons

  if (node.type === 'folder') {
    return (
      <SidebarMenuItem className={cn(level > 0 && "ml-0")}>
        <SidebarMenuButton
          onClick={() => toggleFolder(node.id)}
          className={cn("justify-start w-full group", commonButtonClasses, level > 0 && "pl-4")}
          aria-expanded={isExpanded}
          isActive={expandedFolders.has(node.id) && (node.children || []).some(child => child.id === selectedFileId)}
        >
          {isExpanded ? <ChevronDown className="mr-2 h-5 w-5 group-hover:text-sidebar-accent-foreground" /> : <ChevronRight className="mr-2 h-5 w-5 group-hover:text-sidebar-accent-foreground" />}
          {IconComponent && <IconComponent className="mr-2 h-5 w-5 group-hover:text-sidebar-accent-foreground" />}
          <span className="truncate font-medium group-hover:text-sidebar-accent-foreground">{highlightMatch(node.name, searchTerm)}</span>
        </SidebarMenuButton>
        {isExpanded && node.children && (
          <SidebarMenuSub className={cn("pl-4", level === 0 ? "border-l-0 ml-5" : "ml-5")}>
            {node.children.map((child) => (
              <FileTreeItem
                key={child.id}
                node={child}
                onFileSelect={onFileSelect}
                selectedFileId={selectedFileId}
                searchTerm={searchTerm}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                level={level + 1}
              />
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  }

  // File item
  return (
    <SidebarMenuSubItem className="ml-0">
      <SidebarMenuSubButton
        onClick={() => onFileSelect(node)}
        isActive={selectedFileId === node.id}
        className={cn("justify-start w-full group", commonButtonClasses, "pl-4")}
        style={{ paddingLeft: `${(level) * 1.25 + 1}rem` }} 
      >
        {IconComponent && <IconComponent className="mr-2 h-5 w-5 group-hover:text-sidebar-accent-foreground" />}
        <span className="truncate group-hover:text-sidebar-accent-foreground">{highlightMatch(node.name, searchTerm)}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
};

export default FileTreeItem;
