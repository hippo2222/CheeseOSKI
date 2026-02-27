'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import FileTreeItem from './FileTreeItem';
import type { FileNode } from '@/types';
import { SidebarMenu } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GripVertical, ClipboardType, ListChecks, Baby, BriefcaseMedical, Stethoscope, Scissors, Siren, UserCheck, UserPlus, HeartPulse, Syringe, Ambulance, BookOpenCheck, BookOpen, UserCog, User, UserSquare, UserCircle, User2, UserPlus2, UserCheck2, UserRoundCheck, UserRoundPlus, UserRound, UserRoundCog, UserRoundSearch, UserRoundX, UserRoundMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as ReactDOM from 'react-dom';
import { AnimatePresence, Reorder, motion, useDragControls } from 'framer-motion';

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

type SubfolderEntry = ReturnType<typeof getAllSubfolders>[number];

interface ReorderableSubfolderItemProps {
  sf: SubfolderEntry;
  selectedFileId?: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onFileSelect: (file: FileNode) => void;
}

const ReorderableSubfolderItem: React.FC<ReorderableSubfolderItemProps> = ({
  sf,
  selectedFileId,
  isExpanded,
  onToggle,
  onFileSelect,
}) => {
  const dragControls = useDragControls();
  const isKlin = sf.node.name.toLowerCase().includes('клиническ');
  const isPrakt = sf.node.name.toLowerCase().includes('практическ');
  const parentName = sf.parent.name.toLowerCase();
  let IconComponent = ClipboardType;

  if (parentName.includes('педіатр') || parentName.includes('педиатр')) {
    IconComponent = isKlin ? Baby : BookOpenCheck;
  } else if (parentName.includes('акушер')) {
    IconComponent = isKlin ? BriefcaseMedical : Syringe;
  } else if (parentName.includes('внутрішня') || parentName.includes('внутренняя')) {
    IconComponent = isKlin ? Stethoscope : HeartPulse;
  } else if (parentName.includes('хирург')) {
    IconComponent = isKlin ? Scissors : UserCheck;
  } else if (parentName.includes('екстрен') || parentName.includes('экстрен')) {
    IconComponent = isKlin ? Siren : Ambulance;
  }

  return (
    <Reorder.Item
      value={sf.id}
      dragListener={false}
      dragControls={dragControls}
      className="bg-sidebar-accent/60 border border-sidebar-border rounded-md mb-0.5 mt-1 p-0.5 transition-colors"
    >
      <div className="flex items-center group">
        <div
          className="flex-1 font-medium flex items-center gap-0 cursor-pointer select-none text-xs"
          onClick={() => onToggle(sf.id)}
        >
          <span
            className={
              `inline-flex items-center justify-center rounded-full mr-1 h-5 w-5 ` +
              (isKlin
                ? 'bg-blue-200 text-blue-800'
                : isPrakt
                  ? 'bg-green-200 text-green-800'
                  : 'bg-gray-200 text-gray-700')
            }
          >
            <IconComponent className="h-3.5 w-3.5" />
          </span>
          <span>{sf.name}</span>
          <motion.span
            className="ml-1 text-[10px] inline-flex origin-center"
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.16 }}
          >
            ▶
          </motion.span>
        </div>
        <span
          className="ml-2 text-gray-400 opacity-70 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
          title="Перетащить станцию"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dragControls.start(e);
          }}
        >
          <GripVertical />
        </span>
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key={`${sf.id}-files`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="ml-3 mb-1 pt-1">
              {(sf.node.children || []).filter((f: FileNode) => f.type === 'file').map((file: FileNode) => (
                <div
                  key={file.id}
                  id={`file-item-${file.id}`}
                  className={`py-0.5 px-1 rounded cursor-pointer hover:bg-blue-50 text-xs transition-colors duration-300 ${selectedFileId === file.id ? 'bg-blue-100 font-bold border-l-2 border-blue-500 shadow-sm' : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    onFileSelect(file);
                  }}
                >
                  {file.name}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
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
  const [searchResults, setSearchResults] = useState<{ path: string; preview: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [subfolderOrder, setSubfolderOrder] = React.useState<string[]>([]);

  const [selectMode, setSelectMode] = React.useState(false);
  const [selectedStations, setSelectedStations] = React.useState<{ [subfolderId: string]: FileNode | null }>({});

  const [showHelp, setShowHelp] = React.useState(false);

  const [expandedSubfolders, setExpandedSubfolders] = useState<Set<string>>(new Set());

  const [expandedUnknownFolders, setExpandedUnknownFolders] = useState<Set<string>>(new Set());

  const rootFiles = nodes.filter(n => n.type === 'file');

  useEffect(() => {
    const allSubfolders = getAllSubfolders(nodes);
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const savedOrder = JSON.parse(saved);
      const filtered = savedOrder.filter((id: string) => allSubfolders.some(sf => sf.id === id));
      const missing = allSubfolders.filter(sf => !filtered.includes(sf.id)).map(sf => sf.id);
      setSubfolderOrder([...filtered, ...missing]);
    } else {
      setSubfolderOrder(allSubfolders.map(sf => sf.id));
    }
  }, [nodes]);

  useEffect(() => {
    if (subfolderOrder.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subfolderOrder));
    }
  }, [subfolderOrder]);

  const orderedSubfolders = React.useMemo(() => {
    const allSubfolders = getAllSubfolders(nodes);
    const idToSubfolder: Record<string, ReturnType<typeof getAllSubfolders>[number]> = Object.fromEntries(allSubfolders.map(sf => [sf.id, sf]));
    return subfolderOrder.map((id: string) => idToSubfolder[id]).filter(Boolean);
  }, [nodes, subfolderOrder]);

  useEffect(() => {
    if (selectedFileId) {
      for (const sf of orderedSubfolders) {
        if ((sf.node.children || []).some((f: FileNode) => f.id === selectedFileId)) {
          setExpandedSubfolders(prev => new Set(prev).add(sf.id));
          break;
        }
      }
    }
  }, [selectedFileId, orderedSubfolders]);

  useEffect(() => {
    if (selectedFileId) {
      setTimeout(() => {
        const selectedElement = document.getElementById(`file-item-${selectedFileId}`);
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [selectedFileId, expandedSubfolders]);

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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowHelp(false)}>
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
        {rootFiles.length > 0 && (
          <div className="mb-1">
            <div className="text-[11px] text-gray-500 mb-0.5">Отдельные файлы</div>
            {rootFiles.map(file => (
              <div
                key={file.id}
                id={`file-item-${file.id}`}
                className={`flex items-center px-2 py-1 rounded cursor-pointer hover:bg-blue-50 text-xs transition-colors duration-300 ${selectedFileId === file.id ? 'bg-blue-100 font-bold border-l-2 border-blue-500 shadow-sm' : ''}`}
                onClick={() => onFileSelect(file)}
              >
                <span className="mr-2">{file.icon && React.createElement(file.icon, { size: 14 })}</span>
                <span>{file.name}</span>
              </div>
            ))}
            <hr className="my-1 border-gray-300" />
          </div>
        )}
        <div className="text-[11px] text-gray-500 mb-0.5">Станции</div>
        {!selectMode && (
          <Reorder.Group axis="y" values={subfolderOrder} onReorder={setSubfolderOrder} className="list-none m-0 p-0">
            {orderedSubfolders.map((sf) => (
              <ReorderableSubfolderItem
                key={sf.id}
                sf={sf}
                selectedFileId={selectedFileId}
                isExpanded={expandedSubfolders.has(sf.id)}
                onToggle={toggleSubfolder}
                onFileSelect={onFileSelect}
              />
            ))}
          </Reorder.Group>
        )}
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
                    return (
                      <div key={node.id}>
                        <div
                          className="p-2 bg-gray-100 rounded shadow mb-2 cursor-pointer hover:bg-blue-50 flex items-center justify-between"
                          onClick={() => toggleUnknownFolder(node.id)}
                        >
                          <span>{parent.name} — {node.name}</span>
                          <motion.span
                            className="ml-2 text-xs inline-flex origin-center"
                            animate={{ rotate: expandedUnknownFolders.has(node.id) ? 90 : 0 }}
                            transition={{ duration: 0.16 }}
                          >
                            в–¶
                          </motion.span>
                        </div>
                        <AnimatePresence initial={false}>
                          {expandedUnknownFolders.has(node.id) && (
                            <motion.div
                              key={`${node.id}-unknown-files`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18, ease: 'easeOut' }}
                              className="overflow-hidden"
                            >
                              <div className="ml-4 mb-2 pt-1">
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
                            </motion.div>
                          )}
                        </AnimatePresence>
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
