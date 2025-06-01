'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import FileTreeItem from './FileTreeItem';
import type { FileNode } from '@/types';
import { SidebarMenu } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as ReactDOM from 'react-dom';

// Компонент строки поиска
interface SearchBarProps {
  placeholder?: string;
  onSearch: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder, onSearch }) => {
  const [value, setValue] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch(newValue);
  };
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 mb-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

interface FileTreeViewProps {
  nodes: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedFileId?: string;
  searchTerm: string;
  expandedFolders: Set<string>;
  toggleFolder: (folderId: string) => void;
}

const LOCAL_STORAGE_KEY = 'mednotes-folder-order';

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

const FileTreeView: React.FC<FileTreeViewProps> = ({
  nodes,
  onFileSelect,
  selectedFileId,
  searchTerm,
  expandedFolders,
  toggleFolder,
}) => {
  // Состояния для поиска
  const [searchResults, setSearchResults] = useState<{ path: string; preview: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // drag-and-drop state
  const [rootOrder, setRootOrder] = React.useState<string[]>([]);
  const [liveOrder, setLiveOrder] = React.useState<string[] | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  // Режим "Я знаю, какие будут станции"
  const [selectMode, setSelectMode] = React.useState(false);
  // Сохраняем выбранные станции: { [subfolderId]: fileNode }
  const [selectedStations, setSelectedStations] = React.useState<{ [subfolderId: string]: FileNode | null }>({});

  // Модалка с инструкцией
  const [showHelp, setShowHelp] = React.useState(false);

  // Инициализация порядка из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      setRootOrder(JSON.parse(saved));
    } else {
      setRootOrder(nodes.map(n => n.id));
    }
  }, [nodes]);

  // Сохраняем порядок при изменении
  useEffect(() => {
    if (rootOrder.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rootOrder));
    }
  }, [rootOrder]);

  // Получаем отсортированные корневые папки
  const orderedNodes = React.useMemo(() => {
    const order = liveOrder || rootOrder;
    if (!order.length) return nodes;
    const idToNode = Object.fromEntries(nodes.map(n => [n.id, n]));
    return order.map(id => idToNode[id]).filter(Boolean);
  }, [nodes, rootOrder, liveOrder]);

  // DnD обработчики
  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
    setDraggedIdx(idx);
    setLiveOrder(rootOrder);
  };
  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
    setHoverIdx(idx);
    // Live-перестановка
    if (dragItem.current !== null && dragItem.current !== idx && liveOrder) {
      setLiveOrder(prev => prev ? reorder(prev, dragItem.current!, idx) : null);
      dragItem.current = idx;
    }
  };
  const handleDragEnd = () => {
    if (liveOrder) setRootOrder(liveOrder);
    setLiveOrder(null);
    setDraggedIdx(null);
    setHoverIdx(null);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Поиск по всем PDF-файлам
  const handleTextSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setShowDropdown(true);
    // Новый поиск по серверу
    const res = await fetch(`/api/pdf-search?q=${encodeURIComponent(term)}`);
    const data = await res.json();
    setSearchResults(data);
    setShowDropdown(data.length > 0);
  }, []);

  // Обработка клика по результату поиска
  const handleResultClick = useCallback((result: { path: string; preview: string }) => {
    setShowDropdown(false);
    setSearchResults([]);
    // Находим FileNode по пути
    const findByPath = (nodes: FileNode[], path: string): FileNode | null => {
      for (const node of nodes) {
        if (node.type === 'file' && node.path === path) return node;
        if (node.children) {
          const found = findByPath(node.children, path);
          if (found) return found;
        }
      }
      return null;
    };
    const file = findByPath(nodes, result.path);
    if (file) onFileSelect(file);
  }, [nodes, onFileSelect]);

  // Получить все подпапки (клиническая/практическая) верхнего уровня
  const getSubfolders = (nodes: FileNode[]) => {
    return nodes.flatMap(folder =>
      (folder.children || []).filter(child => child.type === 'folder').map(child => ({
        parent: folder,
        sub: child
      }))
    );
  };

  // Получить выбранные станции (PDF-файлы)
  const chosenFiles = Object.values(selectedStations).filter(Boolean) as FileNode[];

  return (
    <ScrollArea className="h-full flex-1">
      <SidebarMenu className="p-2 relative w-80">
        <Button
          variant="outline"
          className="w-full mb-2 help-btn"
          onClick={() => setShowHelp(true)}
        >
          Как работать со станциями?
        </Button>
        {showHelp && ReactDOM.createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative">
              <button
                className="absolute top-2 right-2 text-xl text-gray-400 hover:text-gray-700"
                onClick={() => setShowHelp(false)}
                aria-label="Закрыть"
              >×</button>
              <h2 className="text-2xl font-bold mb-4">Как работать со станциями?</h2>
              <ul className="list-disc pl-5 space-y-2 text-base text-justify">
                <li><span role="img" aria-label="drag">🖱️</span> <b>Перемещение разделов:</b> Чтобы изменить порядок разделов (например, "Акушерство", "Педиатрия"), тяните их за иконку <span className="inline-block align-middle"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip-vertical inline"><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></svg></span> справа от названия. Порядок меняется в реальном времени и сохраняется автоматически.</li>
                <li><span role="img" aria-label="target">🎯</span> <b>Режим "Я знаю, какие будут станции":</b> Нажмите эту кнопку, чтобы выбрать по одной задаче из каждой подпапки (клиническая и практическая для каждого раздела). После выбора вы сможете быстро переключаться только между этими задачами.</li>
                <li><span role="img" aria-label="lightbulb">💡</span> <b>Зачем это нужно?</b> Такой режим будет полезен, если вам уже известно, какие задачи будут ждать вас на экзамене. Выберите 10 задач и переключайтесь только между ними, чтобы сэкономить время. При этом поиск по прежнему работает по всем файлам и у вас будет возможность найти и открыть любой другой файл при необходимости.</li>
              </ul>
              <div className="mt-6 text-right">
                <Button variant="secondary" onClick={() => setShowHelp(false)}>Понятно</Button>
              </div>
            </div>
          </div>,
          document.body
        )}
        <Button
          variant={selectMode ? 'secondary' : 'outline'}
          className="w-full mb-2"
          onClick={() => setSelectMode(m => !m)}
        >
          {selectMode ? 'Выйти из режима выбора станций' : 'Я знаю, какие будут станции'}
        </Button>
        {selectMode ? (
          <>
            {getSubfolders(orderedNodes).map(({ parent, sub }) => (
              <div key={sub.id} className="mb-2 border rounded p-2 bg-muted">
                <div className="font-semibold mb-1">{parent.name} — {sub.name}</div>
                {(sub.children || []).filter(f => f.type === 'file').map(file => (
                  <label key={file.id} className="flex items-center gap-2 cursor-pointer mb-1">
                    <input
                      type="radio"
                      name={sub.id}
                      checked={selectedStations[sub.id]?.id === file.id}
                      onChange={() => setSelectedStations(prev => ({ ...prev, [sub.id]: file }))}
                    />
                    <span>{file.name}</span>
                  </label>
                ))}
              </div>
            ))}
            {chosenFiles.length === getSubfolders(orderedNodes).length && (
              <div className="mt-4">
                <div className="font-bold mb-2">Выбранные станции:</div>
                {chosenFiles.map(file => (
                  <div
                    key={file.id}
                    className="p-2 bg-white rounded shadow mb-2 cursor-pointer hover:bg-blue-50"
                    onClick={() => onFileSelect(file)}
                  >
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          orderedNodes.map((node, idx) => {
            const isDragging = draggedIdx === idx;
            const isOver = hoverIdx === idx && draggedIdx !== null && draggedIdx !== idx;
            return (
              <div
                key={node.id}
                className={`mb-1 flex items-center group ${isDragging ? 'bg-blue-100 shadow-lg' : ''} ${isOver ? 'ring-2 ring-blue-400' : ''}`}
                style={{ borderRadius: 6 }}
                onDragOver={e => {
                  e.preventDefault();
                  if (draggedIdx !== null && draggedIdx !== idx && liveOrder) {
                    setHoverIdx(idx);
                    setLiveOrder(prev => prev ? reorder(prev, draggedIdx, idx) : null);
                    setDraggedIdx(idx);
                  }
                }}
                onDrop={() => {
                  if (draggedIdx !== null && liveOrder) {
                    setRootOrder(liveOrder);
                  }
                  setLiveOrder(null);
                  setDraggedIdx(null);
                  setHoverIdx(null);
                  dragItem.current = null;
                  dragOverItem.current = null;
                }}
              >
                <div className="flex-1">
                  <FileTreeItem
                    node={node}
                    onFileSelect={onFileSelect}
                    selectedFileId={selectedFileId}
                    searchTerm={searchTerm}
                    expandedFolders={expandedFolders}
                    toggleFolder={toggleFolder}
                    level={0}
                  />
                </div>
                <span
                  draggable
                  onDragStart={() => {
                    handleDragStart(idx);
                  }}
                  onDragEnd={handleDragEnd}
                  className="ml-2 text-gray-400 opacity-70 group-hover:opacity-100 transition-opacity cursor-grab"
                  title="Перетащить раздел"
                >
                  <GripVertical />
                </span>
              </div>
            );
          })
        )}
      </SidebarMenu>
    </ScrollArea>
  );
};

export default FileTreeView;
