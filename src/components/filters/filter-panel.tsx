"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimeType, AnimeStatus, Season, Genre } from "@/types/anime";
import { SearchFilters, DEFAULT_FILTERS } from "@/types/filters";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { fetchGenres } from "@/lib/api/jikan";
import { Loader2, X } from "lucide-react";

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  className?: string;
}

export function FilterPanel({
  filters,
  onFilterChange,
  className = "",
}: FilterPanelProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [genreError, setGenreError] = useState<string | null>(null);
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [yearError, setYearError] = useState<string | null>(null);

  // Fetch genres on mount
  useEffect(() => {
    const loadGenres = async () => {
      try {
        setIsLoadingGenres(true);
        setGenreError(null);
        const genreData = await fetchGenres();
        setGenres(genreData);
      } catch (error) {
        console.error("Failed to fetch genres:", error);
        setGenreError("Failed to load genres");
      } finally {
        setIsLoadingGenres(false);
      }
    };

    loadGenres();
  }, []);

  // Debounce filter changes by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(localFilters);
    }, 300);

    return () => clearTimeout(timer);
  }, [localFilters, onFilterChange]);

  // Update local filters when external filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleGenreToggle = useCallback((genreId: number) => {
    setLocalFilters((prev) => {
      const isSelected = prev.genres.includes(genreId);
      return {
        ...prev,
        genres: isSelected
          ? prev.genres.filter((id) => id !== genreId)
          : [...prev.genres, genreId],
      };
    });
  }, []);

  const handleTypeChange = useCallback((value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      type: value === "all" ? null : (value as AnimeType),
    }));
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: value === "all" ? null : (value as AnimeStatus),
    }));
  }, []);

  const handleSeasonChange = useCallback((value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      season: value === "all" ? null : (value as Season),
    }));
  }, []);

  const handleScoreChange = useCallback((values: number[]) => {
    const [min, max] = values;
    setScoreError(null);

    // Validate score range
    if (min < 0 || min > 10 || max < 0 || max > 10) {
      setScoreError("Score must be between 0 and 10");
      return;
    }

    setLocalFilters((prev) => ({
      ...prev,
      minScore: min === 0 ? null : min,
      maxScore: max === 10 ? null : max,
    }));
  }, []);

  const handleYearChange = useCallback((value: string) => {
    const year = parseInt(value, 10);
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 1;

    setYearError(null);

    if (value === "") {
      setLocalFilters((prev) => ({ ...prev, year: null }));
      return;
    }

    // Validate year range
    if (isNaN(year) || year < 1960 || year > maxYear) {
      setYearError(`Year must be between 1960 and ${maxYear}`);
      return;
    }

    setLocalFilters((prev) => ({ ...prev, year }));
  }, []);

  const handleReset = useCallback(() => {
    setLocalFilters(DEFAULT_FILTERS);
    setScoreError(null);
    setYearError(null);
  }, []);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;

    if (localFilters.genres.length > 0) count++;
    if (localFilters.type !== null) count++;
    if (localFilters.status !== null) count++;
    if (localFilters.season !== null) count++;
    if (localFilters.minScore !== null || localFilters.maxScore !== null)
      count++;
    if (localFilters.year !== null) count++;

    return count;
  }, [localFilters]);

  const activeCount = getActiveFilterCount();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with active filter count and reset button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Filters</h3>
          {activeCount > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {activeCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          disabled={activeCount === 0}
        >
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Genre Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Genres</Label>
        {isLoadingGenres ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading genres...
          </div>
        ) : genreError ? (
          <p className="text-sm text-destructive">{genreError}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {genres.map((genre) => (
              <div key={genre.mal_id} className="flex items-center space-x-2">
                <Checkbox
                  id={`genre-${genre.mal_id}`}
                  checked={localFilters.genres.includes(genre.mal_id)}
                  onCheckedChange={() => handleGenreToggle(genre.mal_id)}
                />
                <label
                  htmlFor={`genre-${genre.mal_id}`}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {genre.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Type Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Type</Label>
        <Select
          value={localFilters.type || "all"}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="tv">TV</SelectItem>
            <SelectItem value="movie">Movie</SelectItem>
            <SelectItem value="ova">OVA</SelectItem>
            <SelectItem value="special">Special</SelectItem>
            <SelectItem value="ona">ONA</SelectItem>
            <SelectItem value="music">Music</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Status</Label>
        <Select
          value={localFilters.status || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="airing">Airing</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Season Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Season</Label>
        <Select
          value={localFilters.season || "all"}
          onValueChange={handleSeasonChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seasons</SelectItem>
            <SelectItem value="winter">Winter</SelectItem>
            <SelectItem value="spring">Spring</SelectItem>
            <SelectItem value="summer">Summer</SelectItem>
            <SelectItem value="fall">Fall</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Score Range Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Score Range</Label>
          <span className="text-sm text-muted-foreground">
            {localFilters.minScore ?? 0} - {localFilters.maxScore ?? 10}
          </span>
        </div>
        <Slider
          min={0}
          max={10}
          step={0.1}
          value={[localFilters.minScore ?? 0, localFilters.maxScore ?? 10]}
          onValueChange={handleScoreChange}
          className="w-full"
        />
        {scoreError && <p className="text-sm text-destructive">{scoreError}</p>}
      </div>

      {/* Year Filter */}
      <div className="space-y-3">
        <Label htmlFor="year-filter" className="text-sm font-medium">
          Year
        </Label>
        <Input
          id="year-filter"
          type="number"
          placeholder="e.g., 2024"
          value={localFilters.year ?? ""}
          onChange={(e) => handleYearChange(e.target.value)}
          min={1960}
          max={new Date().getFullYear() + 1}
        />
        {yearError && <p className="text-sm text-destructive">{yearError}</p>}
      </div>
    </div>
  );
}
