// components/RichTextEditor.jsx
import React, { useState, useRef } from 'react'
import { 
  BoldIcon, 
  ItalicIcon, 
  LinkIcon, 
  CommandLineIcon, // ✅ Changed from CodeIcon
  ListBulletIcon,
  PhotoIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

const RichTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Write your post...', 
  showPreview = true,
  className = '' 
}) => {
  const [isPreview, setIsPreview] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  // Format text functions
  const formatText = (prefix, suffix = '', placeholder = 'text') => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end) || placeholder
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)
    
    const newText = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`
    onChange(newText)
    
    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  const insertText = (text) => {
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const beforeText = value.substring(0, start)
    const afterText = value.substring(start)
    
    const newText = `${beforeText}${text}${afterText}`
    onChange(newText)
    
    setTimeout(() => {
      const newCursorPos = start + text.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }

  // Toolbar actions
  const toolbar = [
    { icon: BoldIcon, action: () => formatText('**', '**', 'bold text'), title: 'Bold' },
    { icon: ItalicIcon, action: () => formatText('*', '*', 'italic text'), title: 'Italic' },
    { icon: CommandLineIcon, action: () => formatText('`', '`', 'code'), title: 'Inline Code' }, // ✅ Updated
    { icon: LinkIcon, action: () => formatText('[', '](url)', 'link text'), title: 'Link' },
    { icon: ListBulletIcon, action: () => insertText('\n- '), title: 'Bullet List' },
  ]

  // Handle file upload
  const handleFileUpload = (files) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageMarkdown = `\n![${file.name}](${e.target.result})\n`
          insertText(imageMarkdown)
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }

  // Render markdown as HTML (basic implementation)
  const renderMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-orange-600 dark:text-orange-400 hover:underline">$1</a>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside space-y-1">$1</ul>')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-1">
          {toolbar.map((tool, index) => (
            <button
              key={index}
              onClick={tool.action}
              title={tool.title}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              type="button"
            >
              <tool.icon className="w-4 h-4" />
            </button>
          ))}
          
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload Image"
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            type="button"
          >
            <PhotoIcon className="w-4 h-4" />
          </button>
        </div>
        
        {showPreview && (
          <button
            onClick={() => setIsPreview(!isPreview)}
            title={isPreview ? 'Edit' : 'Preview'}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            type="button"
          >
            <EyeIcon className="w-4 h-4" />
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </button>
        )}
      </div>

      {/* Input/Preview Area */}
      <div className="relative">
        {!isPreview ? (
          <div 
            className={`relative ${isDragging ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full min-h-[200px] p-4 text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-0 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ resize: 'vertical' }}
            />
            
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600">
                <div className="text-center">
                  <PhotoIcon className="w-12 h-12 mx-auto text-blue-500 mb-2" />
                  <p className="text-blue-600 dark:text-blue-400 font-medium">Drop images here</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div 
            className="min-h-[200px] p-4 prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-white"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  )
}

export default RichTextEditor
