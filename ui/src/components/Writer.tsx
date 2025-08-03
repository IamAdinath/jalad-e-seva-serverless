import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

import './Writer.css';
import { useTranslation } from 'react-i18next';

// --- MenuBar component remains the same ---
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) { return null; }
  return (
    <div className="tiptap-menu-bar">
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
  const {t} = useTranslation();
  const [summary, setSummary] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Placeholder.configure({ placeholder: "Type your content here..." }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const plainText = editor.getText();
      const summaryText = plainText.split(/\s+/).slice(0, 20).join(' ') + (plainText.split(/\s+/).length > 20 ? '...' : '');
      setSummary(summaryText);
    },
  });

  // NEW FUNCTION: Handles file selection and creates a preview URL
  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      setThumbnail(file);
      // Create a temporary URL for the selected file to show a preview
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
    } else {
      setThumbnail(null);
      setPreviewUrl(null);
    }
  }, []);

  // NEW FUNCTION: To handle drag-and-drop functionality
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
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
      {/* SECTION 1: THUMBNAIL UPLOAD (NOW ON TOP) */}
      <div className="form-group">
        <div className="summary-preview">
          <label>{t('writerCategorySelect')}</label>
          <select className="summary-preview">
            <option value="general">{t('writerCategoryGeneral')}</option>
            <option value="news">{t('writerCategoryNews')}</option>
            <option value="updates">{t('writerCategoryUpdates')}</option>
            <option value="events">{t('writerCategoryEvents')}</option>
            <option value="student">{t('navStudents')}</option>
            <option value="farmer">{t('navFarmers')}</option>
            <option value="business">{t('navBusinesses')}</option>
            <option value="artist">{t('navJobs')}</option>
            <option value="individual">{t('navIndividuals')}</option>
            <option value="ngo">{t('navNGOs')}</option>
            <option value="government">{t('navGovernment')}</option>
            <option value="education">{t('navEducation')}</option>
            <option value="health">{t('navHealth')}</option>
            <option value="technology">{t('navTechnology')}</option>
            <option value="environment">{t('navEnvironment')}</option>
            <option value="culture">{t('navCulture')}</option>
            <option value="other">{t('navOthers')}</option>
          </select>
        </div>

        <label>{t('writerThumbnailTitle')}</label>
        <div 
          className="image-dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('thumbnail-input')?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Thumbnail preview" className="image-preview" />
          ) : (
            <p>{t('writerThumbnailPlaceholder')}</p>
          )}
          <input 
            id="thumbnail-input"
            type="file" 
            accept="image/*"
            style={{ display: 'none' }} // Hide the default input
            onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
          />
        </div>
      </div>
      
      {/* SECTION 2: THE EDITOR (NOW IN THE MIDDLE) */}
      <div className="editor-wrapper">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>

      {/* SECTION 3: SUMMARY AND PUBLISH */}
      <div className="form-group">
        <label>{t('witerSummaryTitle')}</label>
        <p className="summary-preview">{summary || t('writerSummaryPlaceholder')}</p>
      </div>

      <div className="publish-button-container">
        <button onClick={handlePublish} className="publish-button">{t('writerPublish')}</button>
      </div>
    </div>
  );
};

export default Writer;