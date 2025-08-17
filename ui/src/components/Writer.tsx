import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useTranslation } from 'react-i18next';
import { createBlog, uploadToS3 } from './utils/apis';
import './Writer.css';

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const createMenuButton = (
    commandName: string,
    activeName: string,
    icon: React.ReactNode,
    label: string,
    params?: any
  ) => {
    const action = () => (editor.chain().focus() as any)[commandName](params).run();

    return (
      <button
        type="button"
        onClick={action}
        className={editor.isActive(activeName, params) ? 'is-active' : ''}
        title={label}
        disabled={!(editor.can() as any)[commandName](params)}
      >
        {icon}
      </button>
    );
  };

  return (
    <div className="writer-menubar">
      {createMenuButton('toggleBold', 'bold', <b>B</b>, 'Bold')}
      {createMenuButton('toggleItalic', 'italic', <i>I</i>, 'Italic')}
      {createMenuButton('toggleStrike', 'strike', <s>S</s>, 'Strikethrough')}
      {createMenuButton('toggleHeading', 'heading', 'H₂', 'Heading (Level 2)', { level: 2 })}
      {createMenuButton('toggleBulletList', 'bulletList', '●', 'Bullet List')}
      {createMenuButton('toggleOrderedList', 'orderedList', '1.', 'Ordered List')}
    </div>
  );
};


const Writer: React.FC = () => {

  const {t} =  useTranslation();
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('general');

  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Placeholder.configure({
        placeholder: "Write Scheme content in detail...",
      }),
    ],
    content: '',
  });

  useEffect(() => {
    if (editor) {
      editor.extensionManager.extensions.find(
        (ext) => ext.name === 'placeholder'
      )!.options.placeholder = "Write Scheme content in detail...";
      editor.view.dispatch(editor.view.state.tr);
    }
  }, [editor, t]);

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setThumbnail(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
    }
  }, [previewUrl]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('is-dragging-over');
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  const handlePublish = () => {
    if (!editor || editor.getText().trim() === '') {
      alert('Content cannot be empty.');
      return;
    }
    if (!title.trim()) {
      alert('Title cannot be empty.');
      return;
    }
    if (!thumbnail) {
      alert('Thumbnail is required.');
      return;
    }
    if (!startDate || !endDate) {
      alert('Start and End dates are required.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date cannot be after End date.');
      return;
    }
    const contentSummary = editor.getText().split(/\s+/).slice(0, 15).join(" ") + "...";

    const blogPostData = {
      title,
      htmlContent: editor.getHTML(),
      contentSummary: contentSummary,
      image: thumbnail,
      startDate,
      endDate,
      category,
      status: "published",
      publishDate: new Date().toISOString(),
    };

    const apiCreateBlog = createBlog(blogPostData);
    console.log("PUBLISHING DATA:", apiCreateBlog);
    alert('Post data has been logged to the console!');
  };

  return (
    <div className="writer-container">
      <div className="writer-layout">
        <div className="form-group">
          <label htmlFor="post-title">{t('writerTitle')}</label>
          <input
            id="post-title"
            type="text"
            className="form-input title-input"
            placeholder={t('writerTitlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>{t('writerThumbnailTitle')}</label>
          <div
            className="image-dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.currentTarget.classList.add('is-dragging-over')}
            onDragLeave={(e) => e.currentTarget.classList.remove('is-dragging-over')}
            onClick={() => document.getElementById('thumbnail-input')?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Thumbnail Preview" className="image-preview" />
            ) : (
              <p>{t('writerThumbnailPlaceholder')}</p>
            )}
            <input
              id="thumbnail-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label>{t('writerContent')}</label>
          <div className="editor-container">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="writer-content" />
          </div>
        </div>

        <div className="metadata-row">
          <div className="form-group">
            <label htmlFor="startDate">{t('BlogStartDate')}</label>
            <input id="startDate" type="date" className="date-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">{t('BlogEndDate')}</label>
            <input id="endDate" type="date" className="date-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="category">{t('writerCategorySelect')}</label>
            <select id="category" className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="general">{t('writerCategoryGeneral')}</option>
              <option value="news">{t('writerCategoryNews')}</option>
              <option value="updates">{t('writerCategoryUpdates')}</option>
            </select>
          </div>
        </div>
      </div>

      <footer className="writer-footer">
        <button type="button" onClick={handlePublish} className="draft-button">
          {t('writerDraft')}
        </button>
        <button type="button" onClick={handlePublish} className="publish-button">
          {t('writerPublish')}
        </button>
      </footer>
    </div>
  );
};

export default Writer;