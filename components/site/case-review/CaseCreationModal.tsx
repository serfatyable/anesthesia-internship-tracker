'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { CaseCategory } from '@/lib/constants/caseCategories';

interface CaseCreationModalProps {
  onClose: () => void;
  onSuccess: () => void;
  categories: readonly CaseCategory[];
}

interface FormData {
  title: string;
  category: string;
  description: string;
  images: File[];
}

export function CaseCreationModal({
  onClose,
  onSuccess,
  categories,
}: CaseCreationModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    description: '',
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(
      file => !allowedTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setError('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file sizes (5MB max per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setError('Each image must be smaller than 5MB.');
      return;
    }

    // Limit to 3 images max
    const totalImages = formData.images.length + files.length;
    if (totalImages > 3) {
      setError('Maximum 3 images allowed.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 3),
    }));
    setError('');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      !formData.title.trim() ||
      !formData.category ||
      !formData.description.trim()
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      // Upload images first
      const imageUrls: string[] = [];
      for (const image of formData.images) {
        const url = await uploadImage(image);
        imageUrls.push(url);
      }

      // Create case
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          category: formData.category,
          description: formData.description.trim(),
          image1Url: imageUrls[0] || undefined,
          image2Url: imageUrls[1] || undefined,
          image3Url: imageUrls[2] || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create case');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Create New Case
            </h2>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              disabled={loading}
            >
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Title */}
            <div>
              <label
                htmlFor='title'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Case Title *
              </label>
              <input
                type='text'
                id='title'
                value={formData.title}
                onChange={e => handleInputChange('title', e.target.value)}
                placeholder='Enter a descriptive title for the case'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                maxLength={200}
                disabled={loading}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor='category'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Category *
              </label>
              <select
                id='category'
                value={formData.category}
                onChange={e => handleInputChange('category', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                disabled={loading}
                required
              >
                <option value=''>Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor='description'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Case Description *
              </label>
              <textarea
                id='description'
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder='Describe the case details, treatment approach, and any important learning points...'
                rows={6}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                maxLength={5000}
                disabled={loading}
                required
              />
              <p className='text-xs text-gray-500 mt-1'>
                {formData.description.length}/5000 characters
              </p>
            </div>

            {/* Images */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Images (Optional)
              </label>
              <p className='text-xs text-gray-500 mb-3'>
                Upload up to 3 images. Max 5MB per image. Supported formats:
                JPEG, PNG, WebP
              </p>

              {/* Image Upload Button */}
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || formData.images.length >= 3}
                className='w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <div className='text-center'>
                  <svg
                    className='w-8 h-8 text-gray-400 mx-auto mb-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                    />
                  </svg>
                  <p className='text-sm text-gray-600'>
                    {formData.images.length >= 3
                      ? 'Maximum images reached'
                      : 'Click to upload images'}
                  </p>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type='file'
                accept='image/jpeg,image/jpg,image/png,image/webp'
                multiple
                onChange={handleImageChange}
                className='hidden'
                disabled={loading}
              />

              {/* Image Previews */}
              {formData.images.length > 0 && (
                <div className='mt-4 grid grid-cols-3 gap-4'>
                  {formData.images.map((image, index) => (
                    <div key={index} className='relative'>
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        width={96}
                        height={96}
                        className='w-full h-24 object-cover rounded-lg border'
                        unoptimized
                      />
                      <button
                        type='button'
                        onClick={() => removeImage(index)}
                        className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600'
                        disabled={loading}
                      >
                        ×
                      </button>
                      <p className='text-xs text-gray-500 mt-1 truncate'>
                        {(image.size / 1024 / 1024).toFixed(1)}MB
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                <p className='text-sm text-red-600'>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Case'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
