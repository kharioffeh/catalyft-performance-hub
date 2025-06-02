
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface EditableCellProps {
  value: string | number;
  editable?: boolean;
  onSave: (value: string | number) => void;
  type?: 'text' | 'number';
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  editable = false,
  onSave,
  type = 'text'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (editable) {
      setIsEditing(true);
      setEditValue(value);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onSave(type === 'number' ? Number(editValue) : editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        type={type}
        className="h-6 text-sm"
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`${editable ? 'cursor-pointer hover:bg-gray-100 px-1 rounded' : ''}`}
      title={editable ? 'Click to edit' : ''}
    >
      {value || '-'}
    </span>
  );
};
