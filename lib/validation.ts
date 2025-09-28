// Common validation utilities for API endpoints

export const isValidItemType = (type: string): type is 'PROCEDURE' | 'KNOWLEDGE' => {
  return ['PROCEDURE', 'KNOWLEDGE'].includes(type);
};

export const validateString = (value: string | null, fieldName: string): string => {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} is required`);
  }
  return value.trim();
};

export const validateContent = (content: string): string => {
  const trimmed = validateString(content, 'Content');
  if (trimmed.length > 2000) {
    throw new Error('Content too long (max 2000 characters)');
  }
  return trimmed;
};

export const validateUserId = (userId: string): string => {
  return validateString(userId, 'User ID');
};

export const validateItemId = (itemId: string | null): string => {
  return validateString(itemId, 'Item ID');
};
