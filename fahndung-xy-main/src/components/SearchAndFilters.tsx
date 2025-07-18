'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, FileText, Calendar, HardDrive, Tag, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface SearchAndFiltersProps {
  onSearch: (searchTerm: string) => void;
  onTagFilter: (tags: string[]) => void;
  onFormatFilter: (formats: string[]) => void;
  onSizeFilter: (minSize?: number, maxSize?: number) => void;
  onDateFilter: (startDate?: string, endDate?: string) => void;
  onSortBy: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  availableTags: string[];
  availableFormats: string[];
  // Externe Filter-States für Reset-Funktionalität
  externalSearchTerm?: string;
  externalSelectedTags?: string[];
  externalSelectedFormats?: string[];
  externalMinSize?: number;
  externalMaxSize?: number;
  externalStartDate?: string;
  externalEndDate?: string;
  externalSortBy?: string;
  externalSortOrder?: 'asc' | 'desc';
}

export default function SearchAndFilters({ 
  onSearch, 
  onTagFilter, 
  onFormatFilter,
  onSizeFilter,
  onDateFilter,
  onSortBy,
  availableTags, 
  availableFormats,
  externalSearchTerm,
  externalSelectedTags,
  externalSelectedFormats,
  externalMinSize,
  externalMaxSize,
  externalStartDate,
  externalEndDate,
  externalSortBy,
  externalSortOrder
}: SearchAndFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(externalSelectedTags || []);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(externalSelectedFormats || []);
  const [showFilters, setShowFilters] = useState(false);
  const [minSize, setMinSize] = useState<string>(externalMinSize ? String(externalMinSize / (1024 * 1024)) : '');
  const [maxSize, setMaxSize] = useState<string>(externalMaxSize ? String(externalMaxSize / (1024 * 1024)) : '');
  const [startDate, setStartDate] = useState<string>(externalStartDate || '');
  const [endDate, setEndDate] = useState<string>(externalEndDate || '');
  const [sortBy, setSortBy] = useState<string>(externalSortBy || 'uploadedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(externalSortOrder || 'desc');

  // Sync mit externen States
  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setSearchTerm(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  useEffect(() => {
    if (externalSelectedTags !== undefined) {
      setSelectedTags(externalSelectedTags);
    }
  }, [externalSelectedTags]);

  useEffect(() => {
    if (externalSelectedFormats !== undefined) {
      setSelectedFormats(externalSelectedFormats);
    }
  }, [externalSelectedFormats]);

  useEffect(() => {
    if (externalMinSize !== undefined) {
      setMinSize(String(externalMinSize / (1024 * 1024)));
    }
  }, [externalMinSize]);

  useEffect(() => {
    if (externalMaxSize !== undefined) {
      setMaxSize(String(externalMaxSize / (1024 * 1024)));
    }
  }, [externalMaxSize]);

  useEffect(() => {
    if (externalStartDate !== undefined) {
      setStartDate(externalStartDate);
    }
  }, [externalStartDate]);

  useEffect(() => {
    if (externalEndDate !== undefined) {
      setEndDate(externalEndDate);
    }
  }, [externalEndDate]);

  useEffect(() => {
    if (externalSortBy !== undefined) {
      setSortBy(externalSortBy);
    }
  }, [externalSortBy]);

  useEffect(() => {
    if (externalSortOrder !== undefined) {
      setSortOrder(externalSortOrder);
    }
  }, [externalSortOrder]);

  // Debounced search
  const debouncedSearch = useCallback((term: string) => {
    const timeoutId = setTimeout(() => {
      onSearch(term);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [onSearch]);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    onTagFilter(selectedTags);
  }, [selectedTags, onTagFilter]);

  useEffect(() => {
    onFormatFilter(selectedFormats);
  }, [selectedFormats, onFormatFilter]);

  useEffect(() => {
    const min = minSize ? parseInt(minSize) * 1024 * 1024 : undefined; // MB zu Bytes
    const max = maxSize ? parseInt(maxSize) * 1024 * 1024 : undefined;
    onSizeFilter(min, max);
  }, [minSize, maxSize, onSizeFilter]);

  useEffect(() => {
    onDateFilter(startDate || undefined, endDate || undefined);
  }, [startDate, endDate, onDateFilter]);

  useEffect(() => {
    onSortBy(sortBy, sortOrder);
  }, [sortBy, sortOrder, onSortBy]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleFormatToggle = (format: string) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSelectedFormats([]);
    setMinSize('');
    setMaxSize('');
    setStartDate('');
    setEndDate('');
    setSortBy('uploadedAt');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchTerm || selectedTags.length > 0 || selectedFormats.length > 0 || minSize || maxSize || startDate || endDate || sortBy !== 'uploadedAt' || sortOrder !== 'desc';

  return (
    <div className="mb-6 space-y-4">
      {/* Hauptsuchleiste und Sortierung */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Bilder suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Sortierung */}
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uploadedAt">Datum</SelectItem>
              <SelectItem value="originalName">Name</SelectItem>
              <SelectItem value="size">Größe</SelectItem>
              <SelectItem value="originalFormat">Format</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2"
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filter
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Aktive Filter Anzeige */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="w-3 h-3" />
              &quot;{searchTerm}&quot;
            </Badge>
          )}
          {selectedTags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {tag}
            </Badge>
          ))}
          {selectedFormats.map(format => (
            <Badge key={format} variant="secondary" className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {format}
            </Badge>
          ))}
          {(minSize || maxSize) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              {minSize && maxSize ? `${minSize}-${maxSize} MB` : minSize ? `>${minSize} MB` : `<${maxSize} MB`}
            </Badge>
          )}
          {(startDate || endDate) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {startDate && endDate ? `${startDate} - ${endDate}` : startDate ? `ab ${startDate}` : `bis ${endDate}`}
            </Badge>
          )}
        </div>
      )}

      {showFilters && (
        <div className="bg-muted/50 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Format-Filter */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Formate</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableFormats.length > 0 ? (
                  availableFormats.map((format) => (
                    <Button
                      key={format}
                      variant={selectedFormats.includes(format) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFormatToggle(format)}
                      className="text-xs"
                    >
                      {format.toUpperCase()}
                    </Button>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Keine Formate verfügbar</p>
                )}
              </div>
            </div>

            {/* Tag-Filter */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>Tags</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.length > 0 ? (
                  availableTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTagToggle(tag)}
                      className="text-xs"
                    >
                      {tag}
                    </Button>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">Keine Tags verfügbar</p>
                )}
              </div>
            </div>

            {/* Größen-Filter */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <span>Dateigröße (MB)</span>
              </h3>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minSize}
                  onChange={(e) => setMinSize(e.target.value)}
                  className="w-20"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxSize}
                  onChange={(e) => setMaxSize(e.target.value)}
                  className="w-20"
                />
              </div>
            </div>

            {/* Datum-Filter */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Upload-Datum</span>
              </h3>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-32"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 