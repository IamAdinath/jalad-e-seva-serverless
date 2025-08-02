import React, { useState } from 'react';
// 1. Import the 'Editor' type for better type safety
import { useEditor, EditorContent, type Editor } from '@tiptap/react'; 
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

import './Writer.css';

// --- The Toolbar Component ---
// We now use the imported 'Editor' type for our props.
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-menu-bar">
      {/* This button should now work correctly */}
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>Bold</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>Italic</button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>Strike</button>
      <button onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'is-active' : ''}>Paragraph</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'is-active' : ''}>Bullet List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'is-active' : ''}>Ordered List</button>
    </div>
  );
};


// --- The Main Writer Component ---
const Writer: React.FC = () => {
  const [summary, setSummary] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null); // State for the image file

  const editor = useEditor({
    extensions: [
      // 2. We explicitly ensure StarterKit is configured. 
      // This is the most reliable way to enable its default features like 'bold'.
      StarterKit.configure(), 
      Placeholder.configure({
        placeholder: 'Start writing your amazing story here…',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const plainText = editor.getText();
      const summaryText = plainText.split(/\s+/).slice(0, 20).join(' ') + (plainText.split(/\s+/).length > 20 ? '...' : '');
      setSummary(summaryText);
    },
  });
  
  const handlePublish = () => {
    if (!editor) return;
    const htmlContent = editor.getHTML();
    if (editor.getText().trim().length === 0) {
      alert('Cannot publish an empty post!');
      return;
    }
    const blogPostData = {
      htmlContent: htmlContent,
      summary: summary,
      thumbnailFile: thumbnail, // We include the thumbnail file in our data
    };
    console.log("Data to be sent to API:", blogPostData);
    alert('Check the console to see the data!');
  };

  return (
    <div className="writer-container">
      {/* ... MenuBar and EditorContent ... */}
      <div className="editor-wrapper">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>

      {/* 3. ADDED THE FILE INPUT BACK IN ITS OWN FORM GROUP */}
      <div className="form-group">
        <label htmlFor="thumbnail">Featured Image (Thumbnail)</label>
        <input 
          id="thumbnail"
          type="file" 
          accept="image/*"
          onChange={(e) => setThumbnail(e.target.files ? e.target.files[0] : null)}
        />
      </div>

      <div className="form-group">
        <label>Auto-Generated Summary (for previews)</label>
        <p className="summary-preview">{summary || 'Start typing to see a summary...'}</p>
      </div>

      <div className="publish-button-container">
        <button onClick={handlePublish} className="publish-button">
          Publish Post
        </button>
      </div>
    </div>
  );
};

export default Writer;