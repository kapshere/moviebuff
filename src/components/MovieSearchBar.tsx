
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MovieSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const MovieSearchBar = ({ onSearch, placeholder = "Search movies..." }: MovieSearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl mx-auto">
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-[#1E1E1E] text-[#F5F5F5] border-[#333333] pl-10 pr-4 py-3 rounded-lg shadow-lg"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] w-5 h-5" />
    </form>
  );
};
