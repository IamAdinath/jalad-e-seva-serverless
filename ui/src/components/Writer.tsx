import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { useNavigate, useLocation } from 'react-router-dom';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useTranslation } from 'react-i18next';
import { createBlog, uploadToS3 } from './utils/apis';
import type { CreateBlogPost } from './utils/types';
import { useToast } from './Toast';
import CategoryDropdown from './CategoryDropdown';
import './Writer.css';

// MenuBar component remains unchanged
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;
  const createMenuButton = (commandName: string, activeName: string, icon: React.ReactNode, label: string, params?: any) => {
    const action = () => (editor.chain().focus() as any)[commandName](params).run();
    return <button type="button" onClick={action} className={editor.isActive(activeName, params) ? 'is-active' : ''} title={label} disabled={!(editor.can() as any)[commandName](params)}>{icon}</button>;
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

// --- HELPER FUNCTION ---
// A small, safe utility to get the file extension
const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 1);
};


const Writer: React.FC = () => {
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.includes('/admin');

  // --- Component State ---
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'published' | 'draft' | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Placeholder.configure({ placeholder: "Write Scheme content in detail..." }),
    ],
    content: '',
  });

  // Effect and file handling logic remain the same
  useEffect(() => {
    if (editor) {
      editor.extensionManager.extensions.find((ext) => ext.name === 'placeholder')!.options.placeholder = "Write Scheme content in detail...";
      editor.view.dispatch(editor.view.state.tr);
    }
  }, [editor, t]);

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showError('Image file size must be less than 5MB.');
        return;
      }
      
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
      showInfo(`Image "${file.name}" selected successfully.`);
    }
  }, [previewUrl, showError, showInfo]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('is-dragging-over');
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileChange(event.dataTransfer.files[0]);
    }
  }, [handleFileChange]);


  // --- UPDATED SUBMISSION LOGIC ---
  const handleSubmit = async (status: 'published' | 'draft') => {
    // 1. --- Form Validation ---
    if (!title.trim()) {
      showWarning('Title cannot be empty.');
      return;
    }
    if (!editor || editor.getText().trim() === '') {
      showWarning('Content cannot be empty.');
      return;
    }
    if (!thumbnail) {
      showWarning('A thumbnail image is required.');
      return;
    }
    if (!startDate || !endDate) {
      showWarning('Start and End dates are required.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showWarning('Start date cannot be after End date.');
      return;
    }
    if (!category) {
      showWarning('Please select a category.');
      return;
    }

    setSubmissionStatus(status);

    try {
      // 2. --- First API Call: Create Blog with JSON Data INCLUDING file extension ---
      const contentSummary = editor.getText().split(/\s+/).slice(0, 20).join(" ") + "...";
      
      // Get the file extension to send to the backend.
      const extension = getFileExtension(thumbnail.name);
      if (!extension) {
        throw new Error("Invalid file type. The file must have an extension (e.g., .jpg, .png).");
      }
      
      const blogPostData = {
        title,
        htmlContent: editor.getHTML(),
        contentSummary,
        startDate,
        endDate,
        category,
        status: status,
        imageType: `${extension}`,
      };

      const createResponse = await createBlog(blogPostData as CreateBlogPost);

      if ('error' in createResponse) {
        throw new Error(createResponse.error || "Failed to save blog.");
      }
      
      if (!createResponse.id) {
        throw new Error("Failed to save blog. No ID returned.");
      }

      const newBlogId = createResponse.id;
      const filename = `${newBlogId}${extension}`; // Use the new blog ID for the filename
      console.log(`Blog created with ID: ${newBlogId}. Now uploading image...`);

      // 3. --- Second API Call: Upload the Image file with the new Blog ID ---
      // The `uploadToS3` function now takes the blogId and the file itself.
      const uploadResponse = await uploadToS3(filename, thumbnail);

      if ('error' in uploadResponse) {
        // Here, you might want to add logic to delete the created blog post
        // to avoid having a blog entry with no image.
        throw new Error("Blog post was saved, but the image upload failed.");
      }
      
      showSuccess(`Blog post saved as ${status} successfully!`);
      
      // Reset form after successful submission
      setTitle('');
      setThumbnail(null);
      setPreviewUrl(null);
      setStartDate('');
      setEndDate('');
      setCategory('');
      editor?.commands.clearContent();

      // Redirect to admin dashboard if accessed from admin route
      if (isAdminRoute) {
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000); // Give time for user to see success message
      }

    } catch (error) {
      // 4. --- Error Handling ---
      console.error(`Failed to save blog as ${status}:`, error);
      showError((error as Error).message);
    } finally {
      // 5. --- Final Step: Re-enable the UI ---
      setSubmissionStatus(null);
    }
  };

  return (
    <div className="writer-container">
      <div className="writer-layout">
        {/* ... All your JSX for inputs and the editor remains the same ... */}
        <div className="form-group">
          <label htmlFor="post-title">{t('writerTitle')}</label>
          <input id="post-title" type="text" className="form-input title-input" placeholder={t('writerTitlePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label>{t('writerThumbnailTitle')}</label>
          <div className="image-dropzone" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onDragEnter={(e) => e.currentTarget.classList.add('is-dragging-over')} onDragLeave={(e) => e.currentTarget.classList.remove('is-dragging-over')} onClick={() => document.getElementById('thumbnail-input')?.click()}>
            {previewUrl ? <img src={previewUrl} alt="Thumbnail Preview" className="image-preview" /> : <p>{t('writerThumbnailPlaceholder')}</p>}
            <input id="thumbnail-input" type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} style={{ display: 'none' }} />
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
            <CategoryDropdown
              value={category}
              onChange={setCategory}
              required
              className="form-input"
            />
          </div>
        </div>
      </div>
      <footer className="writer-footer">
        <button type="button" onClick={() => handleSubmit('draft')} className="draft-button" disabled={!!submissionStatus}>
          {submissionStatus === 'draft' ? 'Saving Draft...' : t('writerDraft')}
        </button>
        <button type="button" onClick={() => handleSubmit('published')} className="publish-button" disabled={!!submissionStatus}>
          {submissionStatus === 'published' ? 'Publishing...' : t('writerPublish')}
        </button>
      </footer>
    </div>
  );
};

export default Writer;