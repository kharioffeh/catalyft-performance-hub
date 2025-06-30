
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { GlassContainer } from '@/components/Glass/GlassContainer';

interface AthleteSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const AthleteSearchBar: React.FC<AthleteSearchBarProps> = ({
  onSearch,
  placeholder = "Search athletes..."
}) => {
  const [query, setQuery] = useState('');

  // Debounce search with 300ms delay
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <GlassContainer className="mx-4 my-2">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-transparent text-gray-800 dark:text-white placeholder-gray-500 border-none outline-none focus:ring-0"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </GlassContainer>
  );
};
