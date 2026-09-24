import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit3,
  Copy,
  Eye,
  Download,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LayoutTemplate,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image as ImageIcon,
  Table2,
  Code,
  Quote,
  Link,
  Check,
  Settings,
  Layers,
  Grid3X3,
  Rows3,
  Columns3
} from 'lucide-react';
import { 
  Button, 
  Card, 
  Input, 
  Select, 
  Badge, 
  Modal,
  Tabs,
  IconButton,
  Tooltip
} from './ui';

// Template types
interface TemplateElement {
  id: string;
  type: 'header' | 'footer' | 'text' | 'section' | 'table' | 'list' | 'image' | 'divider' | 'pageNumber';
  content: string;
  style: TemplateStyle;
  children?: TemplateElement[];
  editable?: boolean;
  required?: boolean;
}

interface TemplateStyle {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  borderWidth?: string;
  borderColor?: string;
  borderRadius?: string;
  lineHeight?: string;
  letterSpacing?: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'bid-proposal' | 'policy-note' | 'compliance-report' | 'custom';
  pageSize: 'A4' | 'Letter' | 'A5';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
  elements: TemplateElement[];
  createdAt: string;
  updatedAt: string;
}

// Default templates
const defaultTemplates: Template[] = [
  {
    id: 'bid-proposal-standard',
    name: 'Standard Bid Proposal',
    description: 'Professional bid proposal template with cover page, executive summary, and structured sections',
    category: 'bid-proposal',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: '50px', bottom: '50px', left: '50px', right: '50px' },
    elements: [
      {
        id: 'cover-page',
        type: 'section',
        content: 'Cover Page',
        style: {},
        children: [
          {
            id: 'header-banner',
            type: 'header',
            content: 'OFFICIAL UK PUBLIC SECTOR TENDER SUBMISSION',
            style: {
              fontFamily: 'Helvetica',
              fontSize: '8px',
              fontWeight: 'bold',
              color: '#64748b',
              textAlign: 'center',
              marginBottom: '10px',
              letterSpacing: '1px'
            },
            editable: true,
            required: true
          },
          {
            id: 'title',
            type: 'text',
            content: 'Tender Response: {{tenderTitle}}',
            style: {
              fontFamily: 'Helvetica',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#0f172a',
              textAlign: 'center',
              marginBottom: '20px'
            },
            editable: true,
            required: true
          },
          {
            id: 'company-info',
            type: 'section',
            content: 'Company Information',
            style: {},
            children: [
              {
                id: 'company-name',
                type: 'text',
                content: 'Submitting Bidder: {{companyName}}',
                style: {
                  fontFamily: 'Helvetica',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#475569',
                  marginBottom: '5px'
                },
                editable: true,
                required: true
              },
              {
                id: 'date',
                type: 'text',
                content: 'Date: {{currentDate}}',
                style: {
                  fontFamily: 'Helvetica',
                  fontSize: '10px',
                  color: '#64748b',
                  marginBottom: '20px'
                },
                editable: true,
                required: true
              }
            ]
          }
        ]
      },
      {
        id: 'executive-summary',
        type: 'section',
        content: 'Executive Summary',
        style: {
          marginTop: '40px',
          marginBottom: '30px'
        },
        children: [
          {
            id: 'executive-title',
            type: 'header',
            content: 'EXECUTIVE SUMMARY',
            style: {
              fontFamily: 'Helvetica',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#0f172a',
              marginBottom: '15px'
            },
            editable: true,
            required: true
          },
          {
            id: 'executive-content',
            type: 'text',
            content: '{{executiveSummary}}',
            style: {
              fontFamily: 'Helvetica',
              fontSize: '10px',
              color: '#334155',
              lineHeight: '1.6'
            },
            editable: true,
            required: true
          }
        ]
      },
      {
        id: 'page-number',
        type: 'pageNumber',
        content: 'Page {{pageNumber}} of {{totalPages}}',
        style: {
          fontFamily: 'Helvetica',
          fontSize: '8px',
          color: '#94a3b8',
          textAlign: 'center',
          marginTop: '20px',
          paddingTop: '10px',
          borderTop: '1px solid #e2e8f0'
        },
        editable: false,
        required: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'policy-note-standard',
    name: 'Policy Note Template',
    description: 'Official GOV.UK policy note formatting with header, metadata, and content sections',
    category: 'policy-note',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: '45px', bottom: '50px', left: '50px', right: '50px' },
    elements: [
      {
        id: 'header-banner',
        type: 'header',
        content: 'GOV.UK CROWN COMMERCIAL SERVICE & CABINET OFFICE REGISTRY',
        style: {
          fontFamily: 'Helvetica',
          fontSize: '8px',
          fontWeight: 'bold',
          color: '#64748b',
          textAlign: 'center',
          marginBottom: '10px',
          letterSpacing: '1px'
        },
        editable: true,
        required: true
      },
      {
        id: 'status-badge',
        type: 'text',
        content: 'STATUS: {{status}}',
        style: {
          fontFamily: 'Helvetica',
          fontSize: '8px',
          fontWeight: 'bold',
          color: '#059669',
          textAlign: 'right',
          marginBottom: '20px'
        },
        editable: true,
        required: true
      },
      {
        id: 'title',
        type: 'header',
        content: '{{reference}}',
        style: {
          fontFamily: 'Helvetica',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#0369a1',
          marginBottom: '10px'
        },
        editable: true,
        required: true
      },
      {
        id: 'main-title',
        type: 'header',
        content: '{{title}}',
        style: {
          fontFamily: 'Helvetica',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#0f172a',
          marginBottom: '20px'
        },
        editable: true,
        required: true
      },
      {
        id: 'metadata-grid',
        type: 'section',
        content: 'Metadata',
        style: {
          backgroundColor: '#f8fafc',
          paddingTop: '15px',
          paddingBottom: '15px',
          paddingLeft: '10px',
          paddingRight: '10px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        },
        children: [
          {
            id: 'category',
            type: 'text',
            content: 'Category: {{categoryName}}',
            style: {
              fontFamily: 'Helvetica',
              fontSize: '8px',
              fontWeight: 'bold',
              color: '#475569'
            },
            editable: true,
            required: true
          }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'compliance-report',
    name: 'Compliance Report',
    description: 'Comprehensive compliance analysis report with scoring, risks, and recommendations',
    category: 'compliance-report',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: '40px', bottom: '40px', left: '45px', right: '45px' },
    elements: [
      {
        id: 'report-header',
        type: 'header',
        content: 'Tender Compliance Analysis Report',
        style: {
          fontFamily: 'Helvetica',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#0f172a',
          textAlign: 'center',
          marginBottom: '5px'
        },
        editable: true,
        required: true
      },
      {
        id: 'compliance-score',
        type: 'section',
        content: 'Compliance Score',
        style: {
          marginTop: '20px',
          marginBottom: '20px'
        },
        children: [
          {
            id: 'score-label',
            type: 'text',
            content: 'Overall Compliance Score:',
            style: {
              fontFamily: 'Helvetica',
              fontSize: '10px',
              fontWeight: 'bold',
              color: '#475569',
              marginBottom: '5px'
            },
            editable: true,
            required: true
          },
          {
            id: 'score-value',
            type: 'text',
            content: '{{complianceScore}}%',
            style: {
              fontFamily: 'Helvetica',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#0f172a'
            },
            editable: true,
            required: true
          }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Font options
const fontOptions = [
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
];

// Font size options
const fontSizeOptions = [
  { value: '6px', label: '6px' },
  { value: '8px', label: '8px' },
  { value: '9px', label: '9px' },
  { value: '10px', label: '10px' },
  { value: '12px', label: '12px' },
  { value: '14px', label: '14px' },
  { value: '16px', label: '16px' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
  { value: '24px', label: '24px' },
  { value: '28px', label: '28px' },
  { value: '32px', label: '32px' },
];

// Font weight options
const fontWeightOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
  { value: '100', label: '100' },
  { value: '200', label: '200' },
  { value: '300', label: '300' },
  { value: '400', label: '400' },
  { value: '500', label: '500' },
  { value: '600', label: '600' },
  { value: '700', label: '700' },
  { value: '800', label: '800' },
  { value: '900', label: '900' },
];

// Text align options
const textAlignOptions = [
  { value: 'left', label: 'Left', icon: <AlignLeft className="h-4 w-4" /> },
  { value: 'center', label: 'Center', icon: <AlignCenter className="h-4 w-4" /> },
  { value: 'right', label: 'Right', icon: <AlignRight className="h-4 w-4" /> },
  { value: 'justify', label: 'Justify', icon: <AlignLeft className="h-4 w-4" /> },
];

// Color presets
const colorPresets = [
  { value: '#0f172a', label: 'Slate 900', color: '#0f172a' },
  { value: '#1e293b', label: 'Slate 800', color: '#1e293b' },
  { value: '#334155', label: 'Slate 700', color: '#334155' },
  { value: '#475569', label: 'Slate 600', color: '#475569' },
  { value: '#64748b', label: 'Slate 500', color: '#64748b' },
  { value: '#94a3b8', label: 'Slate 400', color: '#94a3b8' },
  { value: '#0284c7', label: 'Blue 600', color: '#0284c7' },
  { value: '#0369a1', label: 'Blue 700', color: '#0369a1' },
  { value: '#059669', label: 'Emerald 600', color: '#059669' },
  { value: '#dc2626', label: 'Red 600', color: '#dc2626' },
  { value: '#7c2d12', label: 'Amber 800', color: '#7c2d12' },
  { value: '#7c3aed', label: 'Purple 700', color: '#7c3aed' },
];

// Element type options
const elementTypeOptions = [
  { value: 'header', label: 'Header', icon: <Type className="h-5 w-5" />, description: 'Section header' },
  { value: 'footer', label: 'Footer', icon: <Type className="h-5 w-5" />, description: 'Section footer' },
  { value: 'text', label: 'Text', icon: <AlignLeft className="h-5 w-5" />, description: 'Paragraph text' },
  { value: 'section', label: 'Section', icon: <Layers className="h-5 w-5" />, description: 'Container for multiple elements' },
  { value: 'table', label: 'Table', icon: <Table2 className="h-5 w-5" />, description: 'Data table' },
  { value: 'list', label: 'List', icon: <List className="h-5 w-5" />, description: 'Bullet or numbered list' },
  { value: 'divider', label: 'Divider', icon: <Rows3 className="h-5 w-5" />, description: 'Horizontal rule' },
  { value: 'pageNumber', label: 'Page Number', icon: <FileText className="h-5 w-5" />, description: 'Automatic page numbering' },
];

// Template category options
const categoryOptions = [
  { value: 'bid-proposal', label: 'Bid Proposal' },
  { value: 'policy-note', label: 'Policy Note' },
  { value: 'compliance-report', label: 'Compliance Report' },
  { value: 'custom', label: 'Custom' },
];

// Page size options
const pageSizeOptions = [
  { value: 'A4', label: 'A4 (210 × 297 mm)' },
  { value: 'Letter', label: 'Letter (216 × 279 mm)' },
  { value: 'A5', label: 'A5 (148 × 210 mm)' },
];

// Orientation options
const orientationOptions = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
];

// Margin preset options
const marginPresets = [
  { value: 'narrow', label: 'Narrow', margins: { top: '30px', bottom: '30px', left: '30px', right: '30px' } },
  { value: 'normal', label: 'Normal', margins: { top: '50px', bottom: '50px', left: '50px', right: '50px' } },
  { value: 'wide', label: 'Wide', margins: { top: '70px', bottom: '70px', left: '70px', right: '70px' } },
];

interface PDFTemplateEditorProps {
  onSave?: (template: Template) => void;
  onClose?: () => void;
  initialTemplate?: Template | null;
}

const PDFTemplateEditor: React.FC<PDFTemplateEditorProps> = ({
  onSave,
  onClose,
  initialTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [template, setTemplate] = useState<Template>(
    initialTemplate || defaultTemplates[0]
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [newElementType, setNewElementType] = useState<string>('text');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Generate unique ID
  const generateId = () => {
    return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add new element
  const handleAddElement = (parentId?: string) => {
    const newElement: TemplateElement = {
      id: generateId(),
      type: newElementType as any,
      content: '',
      style: {
        fontFamily: 'Helvetica',
        fontSize: '12px',
        color: '#334155',
        textAlign: 'left',
        marginBottom: '10px',
        lineHeight: '1.5'
      },
      editable: true,
      required: false
    };

    if (parentId) {
      // Add as child
      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (el.id === parentId) {
            return {
              ...el,
              children: [...(el.children || []), newElement]
            };
          }
          if (el.children) {
            return {
              ...el,
              children: el.children.map(child => {
                if (child.id === parentId) {
                  return {
                    ...child,
                    children: [...(child.children || []), newElement]
                  };
                }
                return child;
              })
            };
          }
          return el;
        })
      }));
    } else {
      // Add to root
      setTemplate(prev => ({
        ...prev,
        elements: [...prev.elements, newElement]
      }));
    }

    setIsAddModalOpen(false);
    setNewElementType('text');
  };

  // Update element
  const handleUpdateElement = (id: string, updates: Partial<TemplateElement>) => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el => {
        if (el.id === id) {
          return { ...el, ...updates };
        }
        if (el.children) {
          return {
            ...el,
            children: el.children.map(child => {
              if (child.id === id) {
                return { ...child, ...updates };
              }
              if (child.children) {
                return {
                  ...child,
                  children: child.children.map(grandchild => {
                    if (grandchild.id === id) {
                      return { ...grandchild, ...updates };
                    }
                    return grandchild;
                  })
                };
              }
              return child;
            })
          };
        }
        return el;
      })
    }));
  };

  // Delete element
  const handleDeleteElement = (id: string) => {
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.filter(el => {
        if (el.id === id) return false;
        if (el.children) {
          el.children = el.children.filter(child => child.id !== id);
          if (el.children.length === 0) {
            delete el.children;
          }
        }
        return true;
      })
    }));
    setSelectedElement(null);
  };

  // Move element up
  const handleMoveUp = (id: string, parentId?: string) => {
    if (parentId) {
      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (el.id === parentId && el.children) {
            const index = el.children.findIndex(child => child.id === id);
            if (index > 0) {
              const newChildren = [...el.children];
              [newChildren[index], newChildren[index - 1]] = 
                [newChildren[index - 1], newChildren[index]];
              return { ...el, children: newChildren };
            }
          }
          return el;
        })
      }));
    } else {
      setTemplate(prev => {
        const index = prev.elements.findIndex(el => el.id === id);
        if (index > 0) {
          const newElements = [...prev.elements];
          [newElements[index], newElements[index - 1]] = 
            [newElements[index - 1], newElements[index]];
          return { ...prev, elements: newElements };
        }
        return prev;
      });
    }
  };

  // Move element down
  const handleMoveDown = (id: string, parentId?: string) => {
    if (parentId) {
      setTemplate(prev => ({
        ...prev,
        elements: prev.elements.map(el => {
          if (el.id === parentId && el.children) {
            const index = el.children.findIndex(child => child.id === id);
            if (index < el.children.length - 1) {
              const newChildren = [...el.children];
              [newChildren[index], newChildren[index + 1]] = 
                [newChildren[index + 1], newChildren[index]];
              return { ...el, children: newChildren };
            }
          }
          return el;
        })
      }));
    } else {
      setTemplate(prev => {
        const index = prev.elements.findIndex(el => el.id === id);
        if (index < prev.elements.length - 1) {
          const newElements = [...prev.elements];
          [newElements[index], newElements[index + 1]] = 
            [newElements[index + 1], newElements[index]];
          return { ...prev, elements: newElements };
        }
        return prev;
      });
    }
  };

  // Toggle section expansion
  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  // Find parent ID for an element
  const findParentId = (id: string, elements: TemplateElement[] = template.elements): string | undefined => {
    for (const el of elements) {
      if (el.children) {
        if (el.children.some(child => child.id === id)) {
          return el.id;
        }
        const found = findParentId(id, el.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Get element hierarchy path
  const getElementPath = (id: string, elements: TemplateElement[] = template.elements): TemplateElement[] => {
    const path: TemplateElement[] = [];
    
    const findPath = (targetId: string, currentElements: TemplateElement[], currentPath: TemplateElement[] = []): boolean => {
      for (const el of currentElements) {
        if (el.id === targetId) {
          path.push(...currentPath, el);
          return true;
        }
        if (el.children) {
          if (findPath(targetId, el.children, [...currentPath, el])) {
            return true;
          }
        }
      }
      return false;
    };

    findPath(id, elements);
    return path;
  };

  // Render element tree
  const renderElementTree = (elements: TemplateElement[], depth = 0) => {
    return elements.map((el) => {
      const parentId = findParentId(el.id);
      const hasChildren = el.children && el.children.length > 0;
      const isExpanded = expandedSections.includes(el.id);
      const isSelected = selectedElement?.id === el.id;

      return (
        <motion.div
          key={el.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`
            rounded-lg mb-1
            ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'}
          `}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedElement(el);
          }}
        >
          <div 
            className={`
              flex items-center gap-2 p-3 cursor-pointer
              ${isSelected ? 'bg-blue-100/50' : ''}
            `}
          >
            {/* Indentation */}
            <div className="flex-shrink-0" style={{ width: `${depth * 20}px` }} />
            
            {/* Expand/Collapse Toggle */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection(el.id);
                }}
                className="flex-shrink-0 p-1 rounded hover:bg-slate-200"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                )}
              </button>
            )}
            
            {/* Element Icon */}
            <div className="flex-shrink-0">
              {el.type === 'header' && <Type className="h-4 w-4 text-blue-600" />}
              {el.type === 'footer' && <Type className="h-4 w-4 text-slate-600" />}
              {el.type === 'text' && <AlignLeft className="h-4 w-4 text-slate-500" />}
              {el.type === 'section' && <Layers className="h-4 w-4 text-purple-600" />}
              {el.type === 'table' && <Table2 className="h-4 w-4 text-green-600" />}
              {el.type === 'list' && <List className="h-4 w-4 text-amber-600" />}
              {el.type === 'divider' && <Rows3 className="h-4 w-4 text-slate-400" />}
              {el.type === 'pageNumber' && <FileText className="h-4 w-4 text-indigo-600" />}
            </div>
            
            {/* Element Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-700 truncate">
                  {el.content || el.type}
                </span>
                {el.required && (
                  <Badge variant="danger" size="sm">Required</Badge>
                )}
                {!el.editable && (
                  <Badge variant="secondary" size="sm">System</Badge>
                )}
              </div>
              <div className="text-xs text-slate-500">
                {el.type} {el.children && `(${el.children.length} children)`}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Tooltip content="Delete">
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteElement(el.id);
                  }}
                  disabled={!el.editable}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </IconButton>
              </Tooltip>
              
              <Tooltip content="Move Up">
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveUp(el.id, parentId);
                  }}
                  disabled={!el.editable}
                >
                  <ChevronUp className="h-4 w-4 text-slate-500" />
                </IconButton>
              </Tooltip>
              
              <Tooltip content="Move Down">
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveDown(el.id, parentId);
                  }}
                  disabled={!el.editable}
                >
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
          
          {/* Children */}
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pl-4 border-l border-slate-200"
            >
              {renderElementTree(el.children || [], depth + 1)}
            </motion.div>
          )}
        </motion.div>
      );
    });
  };

  // Handle style change
  const handleStyleChange = (property: keyof TemplateStyle, value: string) => {
    if (selectedElement) {
      handleUpdateElement(selectedElement.id, {
        style: {
          ...selectedElement.style,
          [property]: value
        }
      });
    }
  };

  // Save template
  const handleSave = () => {
    const savedTemplate = {
      ...template,
      updatedAt: new Date().toISOString()
    };
    onSave?.(savedTemplate);
  };

  // Create new template
  const handleNewTemplate = () => {
    setTemplate({
      id: generateId(),
      name: 'Untitled Template',
      description: '',
      category: 'custom',
      pageSize: 'A4',
      orientation: 'portrait',
      margins: { top: '50px', bottom: '50px', left: '50px', right: '50px' },
      elements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setSelectedElement(null);
  };

  // Load template
  const handleLoadTemplate = (template: Template) => {
    setTemplate(template);
    setSelectedElement(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-7xl h-[90vh] max-h-[800px] bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                PDF Template Editor
              </h2>
              <p className="text-sm text-slate-500">
                {template.name} - {template.category}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNewTemplate}>
              <Plus className="h-4 w-4" />
              New Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save Template
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100%-60px)] overflow-hidden">
          {/* Left Sidebar - Template Settings */}
          <div className="w-80 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Template Info */}
              <Card variant="bordered" padding="md">
                <h3 className="font-bold text-slate-900 mb-4">Template Information</h3>
                <div className="space-y-3">
                  <Input
                    label="Template Name"
                    value={template.name}
                    onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                    fullWidth
                  />
                  <Textarea
                    label="Description"
                    value={template.description}
                    onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    fullWidth
                  />
                  <Select
                    label="Category"
                    value={template.category}
                    onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value as any }))}
                    options={categoryOptions}
                    fullWidth
                  />
                </div>
              </Card>

              {/* Page Settings */}
              <Card variant="bordered" padding="md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Page Settings</h3>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSettingsModalOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </IconButton>
                </div>
                <div className="space-y-3">
                  <Select
                    label="Page Size"
                    value={template.pageSize}
                    onChange={(e) => setTemplate(prev => ({ ...prev, pageSize: e.target.value as any }))}
                    options={pageSizeOptions}
                    fullWidth
                  />
                  <Select
                    label="Orientation"
                    value={template.orientation}
                    onChange={(e) => setTemplate(prev => ({ ...prev, orientation: e.target.value as any }))}
                    options={orientationOptions}
                    fullWidth
                  />
                </div>
              </Card>

              {/* Quick Add */}
              <Card variant="bordered" padding="md">
                <h3 className="font-bold text-slate-900 mb-4">Add Element</h3>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setIsAddModalOpen(true)}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add Element
                </Button>
              </Card>

              {/* Templates Library */}
              <Card variant="bordered" padding="md">
                <h3 className="font-bold text-slate-900 mb-4">Templates Library</h3>
                <div className="space-y-2">
                  {defaultTemplates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => handleLoadTemplate(tpl)}
                      className={`
                        w-full text-left p-3 rounded-lg text-sm transition
                        hover:bg-slate-100
                        ${template.id === tpl.id ? 'bg-blue-50 border border-blue-200' : ''}
                      `}
                    >
                      <div className="font-medium text-slate-700">{tpl.name}</div>
                      <div className="text-xs text-slate-500 truncate">{tpl.description}</div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Center - Element Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900">
                  {selectedElement ? 
                    `${elementTypeOptions.find(e => e.value === selectedElement.type)?.label || selectedElement.type}: ${selectedElement.content || 'Untitled'}` 
                    : 'Select an element'}
                </h4>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedElement && (
                  <>
                    <Tooltip content="Delete Element">
                      <IconButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteElement(selectedElement.id)}
                        disabled={!selectedElement.editable}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content="Copy Element">
                      <IconButton
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Copy logic would go here
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>

            {/* Element Tree */}
            <div className="flex-1 overflow-y-auto p-4">
              {template.elements.length === 0 ? (
                <div className="text-center py-12">
                  <LayoutTemplate className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">No elements added yet</p>
                  <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Add First Element
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {renderElementTree(template.elements)}
                </div>
              )}
            </div>

            {/* Element Properties Panel */}
            {selectedElement && (
              <div className="w-80 border-l border-slate-200 bg-slate-50 p-4 overflow-y-auto">
                <h3 className="font-bold text-slate-900 mb-4">Element Properties</h3>
                
                <div className="space-y-4">
                  {/* Content */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Content
                    </label>
                    <Textarea
                      value={selectedElement.content}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { content: e.target.value })}
                      rows={3}
                      fullWidth
                      disabled={!selectedElement.editable}
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Element Type
                    </label>
                    <Select
                      value={selectedElement.type}
                      onChange={(e) => handleUpdateElement(selectedElement.id, { type: e.target.value as any })}
                      options={elementTypeOptions.map(opt => ({
                        value: opt.value,
                        label: opt.label
                      }))}
                      fullWidth
                      disabled={!selectedElement.editable}
                    />
                  </div>

                  {/* Typography */}
                  <Card variant="bordered" padding="md">
                    <h4 className="font-bold text-slate-900 mb-3">Typography</h4>
                    <div className="space-y-3">
                      <Select
                        label="Font Family"
                        value={selectedElement.style.fontFamily || 'Helvetica'}
                        onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                        options={fontOptions}
                        fullWidth
                        disabled={!selectedElement.editable}
                      />
                      <Select
                        label="Font Size"
                        value={selectedElement.style.fontSize || '12px'}
                        onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                        options={fontSizeOptions}
                        fullWidth
                        disabled={!selectedElement.editable}
                      />
                      <Select
                        label="Font Weight"
                        value={selectedElement.style.fontWeight || 'normal'}
                        onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                        options={fontWeightOptions}
                        fullWidth
                        disabled={!selectedElement.editable}
                      />
                      <div className="grid grid-cols-4 gap-2">
                        {textAlignOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleStyleChange('textAlign', opt.value)}
                            className={`
                              p-2 rounded-lg border-2 transition
                              ${selectedElement.style.textAlign === opt.value 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-transparent hover:border-slate-300'}
                              ${!selectedElement.editable ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            disabled={!selectedElement.editable}
                          >
                            {opt.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Colors */}
                  <Card variant="bordered" padding="md">
                    <h4 className="font-bold text-slate-900 mb-3">Colors</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Text Color
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {colorPresets.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => handleStyleChange('color', color.value)}
                              className={`
                                w-6 h-6 rounded-full border-2 transition
                                ${selectedElement.style.color === color.value 
                                  ? 'border-blue-500 ring-2 ring-blue-500' 
                                  : 'border-transparent hover:border-slate-300'}
                                ${!selectedElement.editable ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                              style={{ backgroundColor: color.value }}
                              disabled={!selectedElement.editable}
                              aria-label={color.label}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Background Color
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {[...colorPresets, { value: 'transparent', label: 'Transparent', color: 'transparent' }].map((color) => (
                            <button
                              key={color.value}
                              onClick={() => handleStyleChange('backgroundColor', color.value)}
                              className={`
                                w-6 h-6 rounded-full border-2 transition
                                ${selectedElement.style.backgroundColor === color.value 
                                  ? 'border-blue-500 ring-2 ring-blue-500' 
                                  : 'border-transparent hover:border-slate-300'}
                                ${!selectedElement.editable ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                              style={{ backgroundColor: color.value }}
                              disabled={!selectedElement.editable}
                              aria-label={color.label}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Spacing */}
                  <Card variant="bordered" padding="md">
                    <h4 className="font-bold text-slate-900 mb-3">Spacing</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Margin Top"
                        value={selectedElement.style.marginTop || ''}
                        onChange={(e) => handleStyleChange('marginTop', e.target.value)}
                        placeholder="0px"
                        fullWidth
                        disabled={!selectedElement.editable}
                      />
                      <Input
                        label="Margin Bottom"
                        value={selectedElement.style.marginBottom || ''}
                        onChange={(e) => handleStyleChange('marginBottom', e.target.value)}
                        placeholder="0px"
                        fullWidth
                        disabled={!selectedElement.editable}
                      />
                      <Input
                        label="Padding Top"
                        value={selectedElement.style.paddingTop || ''}
                        onChange={(e) => handleStyleChange('paddingTop', e.target.value)}
                        placeholder="0px"
                        fullWidth
                        disabled={!selectedElement.editable}
                      />
                      <Input
                        label="Padding Bottom"
                        value={selectedElement.style.paddingBottom || ''}
                        onChange={(e) => handleStyleChange('paddingBottom', e.target.value)}
                        placeholder="0px"
                        fullWidth
                        disabled={!selectedElement.editable}
                      />
                    </div>
                  </Card>

                  {/* Advanced */}
                  <Card variant="bordered" padding="md">
                    <h4 className="font-bold text-slate-900 mb-3">Advanced</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Line Height"
                        value={selectedElement.style.lineHeight || ''}
                        onChange={(e) => handleStyleChange('lineHeight', e.target.value)}
                        placeholder="1.5"
                        fullWidth
                        disabled={!selectedElement.editable}
                      />
                      <Input
                        label="Letter Spacing"
                        value={selectedElement.style.letterSpacing || ''}
                        onChange={(e) => handleStyleChange('letterSpacing', e.target.value)}
                        placeholder="0px"
                        fullWidth
                        disabled={!selectedElement.editable}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <Input
                        label="Border Width"
                        value={selectedElement.style.borderWidth || ''}
                        onChange={(e) => handleStyleChange('borderWidth', e.target.value)}
                        placeholder="0px"
                        fullWidth
                        disabled={!selectedElement.editable}
                      />
                      <Select
                        label="Border Radius"
                        value={selectedElement.style.borderRadius || ''}
                        onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                        options={[
                          { value: '', label: 'None' },
                          { value: '2px', label: '2px' },
                          { value: '4px', label: '4px' },
                          { value: '6px', label: '6px' },
                          { value: '8px', label: '8px' },
                          { value: '12px', label: '12px' },
                          { value: '16px', label: '16px' },
                          { value: '50%', label: '50%' },
                        ]}
                        fullWidth
                        disabled={!selectedElement.editable}
                      />
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Element Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Element"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-slate-600">
              Select the type of element you want to add:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {elementTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setNewElementType(opt.value)}
                  className={`
                    p-3 rounded-xl border-2 transition
                    ${newElementType === opt.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-transparent hover:border-slate-300 bg-slate-50'}
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-xs text-slate-500">{opt.description}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleAddElement(selectedElement?.id)}
                rightIcon={<Plus className="h-4 w-4" />}
              >
                Add Element
              </Button>
            </div>
          </div>
        </Modal>

        {/* Page Settings Modal */}
        <Modal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          title="Page Settings"
          size="md"
        >
          <div className="space-y-4">
            <Card variant="bordered" padding="md">
              <h4 className="font-bold text-slate-900 mb-3">Margins</h4>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Top"
                  value={template.margins.top}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    margins: { ...prev.margins, top: e.target.value }
                  }))}
                  placeholder="50px"
                  fullWidth
                />
                <Input
                  label="Bottom"
                  value={template.margins.bottom}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    margins: { ...prev.margins, bottom: e.target.value }
                  }))}
                  placeholder="50px"
                  fullWidth
                />
                <Input
                  label="Left"
                  value={template.margins.left}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    margins: { ...prev.margins, left: e.target.value }
                  }))}
                  placeholder="50px"
                  fullWidth
                />
                <Input
                  label="Right"
                  value={template.margins.right}
                  onChange={(e) => setTemplate(prev => ({
                    ...prev,
                    margins: { ...prev.margins, right: e.target.value }
                  }))}
                  placeholder="50px"
                  fullWidth
                />
              </div>
              <div className="mt-3 flex gap-2">
                {marginPresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    size="sm"
                    onClick={() => setTemplate(prev => ({
                      ...prev,
                      margins: preset.margins
                    }))}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </Card>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setIsSettingsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsSettingsModalOpen(false)}>
                Save Settings
              </Button>
            </div>
          </div>
        </Modal>

        {/* Preview Modal */}
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Template Preview"
          size="full"
        >
          <div className="bg-slate-50 rounded-xl p-6 h-[70vh] overflow-y-auto">
            <div 
              className="bg-white rounded-xl border border-slate-200 p-8"
              style={{
                width: template.pageSize === 'A4' ? '210mm' : 
                       template.pageSize === 'Letter' ? '216mm' : '148mm',
                minHeight: template.orientation === 'portrait' ? '297mm' : '210mm',
                backgroundColor: '#ffffff',
                position: 'relative'
              }}
            >
              {/* Simulated PDF Content */}
              <div 
                className="space-y-4"
                style={{
                  paddingTop: template.margins.top,
                  paddingBottom: template.margins.bottom,
                  paddingLeft: template.margins.left,
                  paddingRight: template.margins.right
                }}
              >
                {template.elements.map((el) => (
                  <div key={el.id} className="space-y-2">
                    {el.type === 'header' && (
                      <h1 
                        style={{
                          fontFamily: el.style.fontFamily || 'Helvetica',
                          fontSize: el.style.fontSize || '14px',
                          fontWeight: el.style.fontWeight || 'bold',
                          color: el.style.color || '#0f172a',
                          textAlign: el.style.textAlign || 'left',
                          marginTop: el.style.marginTop || '0',
                          marginBottom: el.style.marginBottom || '10px',
                          lineHeight: el.style.lineHeight || '1.5',
                          letterSpacing: el.style.letterSpacing || '0',
                          backgroundColor: el.style.backgroundColor || 'transparent',
                          paddingTop: el.style.paddingTop || '0',
                          paddingBottom: el.style.paddingBottom || '0',
                          paddingLeft: el.style.paddingLeft || '0',
                          paddingRight: el.style.paddingRight || '0',
                          borderWidth: el.style.borderWidth || '0',
                          borderColor: el.style.borderColor || 'transparent',
                          borderRadius: el.style.borderRadius || '0',
                          borderStyle: 'solid'
                        }}
                        dangerouslySetInnerHTML={{ __html: el.content.replace(/\{\{/g, '<strong>').replace(/\}\}/g, '</strong>') }}
                      />
                    )}
                    {el.type === 'text' && (
                      <p 
                        style={{
                          fontFamily: el.style.fontFamily || 'Helvetica',
                          fontSize: el.style.fontSize || '12px',
                          fontWeight: el.style.fontWeight || 'normal',
                          color: el.style.color || '#334155',
                          textAlign: el.style.textAlign || 'left',
                          marginTop: el.style.marginTop || '0',
                          marginBottom: el.style.marginBottom || '10px',
                          lineHeight: el.style.lineHeight || '1.5',
                          letterSpacing: el.style.letterSpacing || '0',
                          backgroundColor: el.style.backgroundColor || 'transparent',
                          paddingTop: el.style.paddingTop || '0',
                          paddingBottom: el.style.paddingBottom || '0',
                          paddingLeft: el.style.paddingLeft || '0',
                          paddingRight: el.style.paddingRight || '0',
                          borderWidth: el.style.borderWidth || '0',
                          borderColor: el.style.borderColor || 'transparent',
                          borderRadius: el.style.borderRadius || '0',
                          borderStyle: 'solid'
                        }}
                        dangerouslySetInnerHTML={{ __html: el.content.replace(/\{\{/g, '<strong>').replace(/\}\}/g, '</strong>') }}
                      />
                    )}
                    {el.type === 'divider' && (
                      <hr 
                        style={{
                          marginTop: el.style.marginTop || '20px',
                          marginBottom: el.style.marginBottom || '20px',
                          border: 'none',
                          borderTop: `1px solid ${el.style.borderColor || '#e2e8f0'}`,
                          borderRadius: el.style.borderRadius || '0'
                        }}
                      />
                    )}
                    {el.type === 'section' && (
                      <div 
                        style={{
                          marginTop: el.style.marginTop || '0',
                          marginBottom: el.style.marginBottom || '20px',
                          backgroundColor: el.style.backgroundColor || 'transparent',
                          paddingTop: el.style.paddingTop || '15px',
                          paddingBottom: el.style.paddingBottom || '15px',
                          paddingLeft: el.style.paddingLeft || '10px',
                          paddingRight: el.style.paddingRight || '10px',
                          borderWidth: el.style.borderWidth || '0',
                          borderColor: el.style.borderColor || 'transparent',
                          borderRadius: el.style.borderRadius || '8px',
                          borderStyle: 'solid'
                        }}
                      >
                        {el.content && (
                          <h2 
                            style={{
                              fontFamily: el.style.fontFamily || 'Helvetica',
                              fontSize: el.style.fontSize || '12px',
                              fontWeight: el.style.fontWeight || 'bold',
                              color: el.style.color || '#0f172a',
                              textAlign: el.style.textAlign || 'left',
                              lineHeight: el.style.lineHeight || '1.5',
                              letterSpacing: el.style.letterSpacing || '0'
                            }}
                            dangerouslySetInnerHTML={{ __html: el.content.replace(/\{\{/g, '<strong>').replace(/\}\}/g, '</strong>') }}
                          />
                        )}
                        {el.children && el.children.map((child) => (
                          <div key={child.id} className="mt-2">
                            {child.type === 'text' && (
                              <p 
                                style={{
                                  fontFamily: child.style.fontFamily || 'Helvetica',
                                  fontSize: child.style.fontSize || '10px',
                                  fontWeight: child.style.fontWeight || 'normal',
                                  color: child.style.color || '#334155',
                                  textAlign: child.style.textAlign || 'left',
                                  lineHeight: child.style.lineHeight || '1.5',
                                  letterSpacing: child.style.letterSpacing || '0'
                                }}
                                dangerouslySetInnerHTML={{ __html: child.content.replace(/\{\{/g, '<strong>').replace(/\}\}/g, '</strong>') }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Simulated Footer */}
              <div 
                className="absolute bottom-0 left-0 right-0 p-4"
                style={{
                  paddingLeft: template.margins.left,
                  paddingRight: template.margins.right,
                  paddingBottom: template.margins.bottom
                }}
              >
                <div 
                  className="text-center text-xs text-slate-500"
                  style={{ fontFamily: 'Helvetica' }}
                >
                  Generated by BidSmith ASF | Page 1
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setIsPreviewOpen(false);
                handleSave();
              }}
            >
              <Save className="h-4 w-4" />
              Save & Close
            </Button>
          </div>
        </Modal>
      </motion.div>
    </div>
  );
};

// Helper component for textarea
const Textarea = ({
  label,
  value,
  onChange,
  rows = 3,
  fullWidth = true,
  disabled = false,
  className = '',
  ...props
}: any) => (
  <div className={`w-full ${fullWidth ? '' : 'inline-block'}`}>
    {label && (
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label}
      </label>
    )}
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      className={`
        w-full rounded-xl border border-slate-300 bg-white px-4 py-3
        text-slate-700 placeholder:text-slate-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        resize-vertical
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    />
  </div>
);

export default PDFTemplateEditor;
