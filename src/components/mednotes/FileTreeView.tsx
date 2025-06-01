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

const LOCAL_STORAGE_KEY = 'mednotes-subfolder-order';

function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

// Получить все подпапки (клиническая/практическая) верхнего уровня
const getAllSubfolders = (nodes: FileNode[]) => {
  return nodes.flatMap(folder =>
    (folder.children || []).filter(child => child.type === 'folder').map(sub => ({
      id: sub.id,
      name: `${folder.name} — ${sub.name}`,
      node: sub,
      parent: folder,
    }))
  );
};

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
  const [subfolderOrder, setSubfolderOrder] = React.useState<string[]>([]);
  const [liveSubfolderOrder, setLiveSubfolderOrder] = React.useState<string[] | null>(null);
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

  // Состояние для раскрытия подпапок
  const [expandedSubfolders, setExpandedSubfolders] = useState<Set<string>>(new Set());

  // Состояние для раскрытия подпапок в итоговом списке выбора
  const [expandedUnknownFolders, setExpandedUnknownFolders] = useState<Set<string>>(new Set());

  // Получить одиночные файлы из корня
  const rootFiles = nodes.filter(n => n.type === 'file');

  // Инициализация порядка подпапок из localStorage
  useEffect(() => {
    const allSubfolders = getAllSubfolders(nodes);
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const savedOrder = JSON.parse(saved);
      // Сохраняем только те, что есть сейчас
      const filtered = savedOrder.filter((id: string) => allSubfolders.some(sf => sf.id === id));
      // Добавляем новые подпапки в конец
      const missing = allSubfolders.filter(sf => !filtered.includes(sf.id)).map(sf => sf.id);
      setSubfolderOrder([...filtered, ...missing]);
    } else {
      setSubfolderOrder(allSubfolders.map(sf => sf.id));
    }
  }, [nodes]);

  // Сохраняем порядок подпапок при изменении
  useEffect(() => {
    if (subfolderOrder.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subfolderOrder));
    }
  }, [subfolderOrder]);

  const orderedSubfolders = React.useMemo(() => {
    const allSubfolders = getAllSubfolders(nodes);
    const idToSubfolder: Record<string, ReturnType<typeof getAllSubfolders>[number]> = Object.fromEntries(allSubfolders.map(sf => [sf.id, sf]));
    const order = liveSubfolderOrder || subfolderOrder;
    return order.map((id: string) => idToSubfolder[id]).filter(Boolean);
  }, [nodes, subfolderOrder, liveSubfolderOrder]);

  // Получить выбранные станции (PDF-файлы)
  const chosenFiles = Object.values(selectedStations).filter(Boolean) as FileNode[];

  const toggleSubfolder = (id: string) => {
    setExpandedSubfolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleUnknownFolder = (id: string) => {
    setExpandedUnknownFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
                <li><span role="img" aria-label="drag">🖱️</span> <b>Перемещение станций:</b> Теперь можно менять порядок всех клинических и практических станций независимо друг от друга. Просто тяните нужную станцию за иконку справа от названия.</li>
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
        {/* Одиночные файлы из корня */}
        {rootFiles.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">Отдельные файлы</div>
            {rootFiles.map(file => (
              <div
                key={file.id}
                className={`mb-1 flex items-center px-2 py-1 rounded cursor-pointer hover:bg-blue-50 ${selectedFileId === file.id ? 'bg-blue-100 font-bold' : ''}`}
                onClick={() => onFileSelect(file)}
              >
                <span className="mr-2">{file.icon && React.createElement(file.icon, { size: 16 })}</span>
                <span>{file.name}</span>
              </div>
            ))}
            <hr className="my-2 border-gray-300" />
          </div>
        )}
        {/* Список подпапок (станций) */}
        <div className="text-xs text-gray-500 mb-1">Станции</div>
        {!selectMode && orderedSubfolders.map((sf, idx) => {
          const isDragging = draggedIdx === idx;
          const isOver = hoverIdx === idx && draggedIdx !== null && draggedIdx !== idx;
          return (
            <div key={sf.id}>
              <div
                className={`mb-1 flex items-center group`}
                style={{ borderRadius: 6 }}
              >
                <div
                  className={`flex-1 font-semibold flex items-center gap-2 cursor-pointer select-none`}
                  onClick={() => toggleSubfolder(sf.id)}
                >
                  <span>{sf.name}</span>
                  <span className="ml-1 text-xs">{expandedSubfolders.has(sf.id) ? '▼' : '▶'}</span>
                </div>
                <span
                  draggable
                  onDragStart={() => {
                    dragItem.current = idx;
                    setDraggedIdx(idx);
                    setLiveSubfolderOrder(subfolderOrder);
                  }}
                  onDragEnd={() => {
                    if (liveSubfolderOrder) setSubfolderOrder(liveSubfolderOrder);
                    setLiveSubfolderOrder(null);
                    setDraggedIdx(null);
                    setHoverIdx(null);
                    dragItem.current = null;
                    dragOverItem.current = null;
                  }}
                  onDragOver={e => {
                    e.preventDefault();
                    if (draggedIdx !== null && draggedIdx !== idx && liveSubfolderOrder) {
                      setHoverIdx(idx);
                      setLiveSubfolderOrder(prev => prev ? reorder(prev, draggedIdx, idx) : null);
                      setDraggedIdx(idx);
                    }
                  }}
                  onDrop={() => {
                    if (draggedIdx !== null && liveSubfolderOrder) {
                      setSubfolderOrder(liveSubfolderOrder);
                    }
                    setLiveSubfolderOrder(null);
                    setDraggedIdx(null);
                    setHoverIdx(null);
                    dragItem.current = null;
                    dragOverItem.current = null;
                  }}
                  className={`ml-2 text-gray-400 opacity-70 group-hover:opacity-100 transition-opacity cursor-grab ${isDragging ? 'bg-blue-100 shadow-lg' : ''} ${isOver ? 'ring-2 ring-blue-400' : ''}`}
                  title="Перетащить станцию"
                >
                  <GripVertical />
                </span>
              </div>
              {expandedSubfolders.has(sf.id) && (
                <div className="ml-4 mb-2">
                  {(sf.node.children || []).filter((f: FileNode) => f.type === 'file').map((file: FileNode) => (
                    <div
                      key={file.id}
                      className={`py-1 px-2 rounded cursor-pointer hover:bg-blue-50 ${selectedFileId === file.id ? 'bg-blue-100 font-bold' : ''}`}
                      onClick={e => {
                        e.stopPropagation();
                        onFileSelect(file);
                      }}
                    >
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {selectMode && (
          <>
            {orderedSubfolders.map(({ parent, node }) => (
              <div key={node.id} className="mb-2 border rounded p-2 bg-muted">
                <div className="font-semibold mb-1">{parent.name} — {node.name}</div>
                {(node.children || []).filter((f: FileNode) => f.type === 'file').map((file: FileNode) => (
                  <label key={file.id} className="flex items-center gap-2 cursor-pointer mb-1">
                    <input
                      type="radio"
                      name={node.id}
                      checked={selectedStations[node.id]?.id === file.id}
                      onChange={() => setSelectedStations(prev => ({ ...prev, [node.id]: file }))}
                    />
                    <span>{file.name}</span>
                  </label>
                ))}
                {/* Вариант "Не знаю задачи для этой станции" */}
                <label className="flex items-center gap-2 cursor-pointer mb-1 text-gray-500">
                  <input
                    type="radio"
                    name={node.id}
                    checked={!selectedStations[node.id]}
                    onChange={() => setSelectedStations(prev => ({ ...prev, [node.id]: null }))}
                  />
                  <span>Не знаю задачи для этой станции</span>
                </label>
              </div>
            ))}
            {/* Итоговый список выбранных станций */}
            {Object.keys(selectedStations).length === orderedSubfolders.length && (
              <div className="mt-4">
                <div className="font-bold mb-2">Выбранные станции:</div>
                {orderedSubfolders.map(({ node, parent }) => {
                  const file = selectedStations[node.id];
                  if (file) {
                    return (
                      <div
                        key={file.id}
                        className="p-2 bg-white rounded shadow mb-2 cursor-pointer hover:bg-blue-50"
                        onClick={() => onFileSelect(file)}
                      >
                        {file.name}
                      </div>
                    );
                  } else {
                    // Не выбрана задача — показываем подпапку
                    return (
                      <div key={node.id}>
                        <div
                          className="p-2 bg-gray-100 rounded shadow mb-2 cursor-pointer hover:bg-blue-50 flex items-center justify-between"
                          onClick={() => toggleUnknownFolder(node.id)}
                        >
                          <span>{parent.name} — {node.name}</span>
                          <span className="ml-2 text-xs">{expandedUnknownFolders.has(node.id) ? '▼' : '▶'}</span>
                        </div>
                        {expandedUnknownFolders.has(node.id) && (
                          <div className="ml-4 mb-2">
                            {(node.children || []).filter((f: FileNode) => f.type === 'file').map((file: FileNode) => (
                              <div
                                key={file.id}
                                className="py-1 px-2 rounded cursor-pointer hover:bg-blue-50"
                                onClick={() => onFileSelect(file)}
                              >
                                {file.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </>
        )}
      </SidebarMenu>
    </ScrollArea>
  );
};

export default FileTreeView;
