
import React from 'react';
import { EnhancedTemplateCard } from './EnhancedTemplateCard';

interface MasonryGridProps {
  data: any[];
  type: 'templates' | 'programs';
  onView: (templateId: string) => void;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  onAssign: (template: any) => void;
  deleteLoading: boolean;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({
  data,
  type,
  onView,
  onEdit,
  onDelete,
  onAssign,
  deleteLoading,
}) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-white/30 mb-4">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No {type} found
        </h3>
        <p className="text-white/60">
          Create your first {type === 'templates' ? 'training program' : 'workout template'} to get started
        </p>
      </div>
    );
  }

  return (
    <div className="masonry-grid">
      {data.map((item, index) => (
        <EnhancedTemplateCard
          key={item.id}
          template={item}
          type={type}
          index={index}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssign={onAssign}
          deleteLoading={deleteLoading}
        />
      ))}
      
      <style>{`
        .masonry-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 0.75rem;
          grid-auto-rows: auto;
        }
        
        @media (max-width: 640px) {
          .masonry-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }
        
        @media (min-width: 640px) and (max-width: 768px) {
          .masonry-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 0.75rem;
          }
        }
        
        @media (min-width: 768px) and (max-width: 1024px) {
          .masonry-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
          }
        }
        
        @media (min-width: 1024px) {
          .masonry-grid {
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};
