import React from 'react';

export const SkeletonPost: React.FC = () => {
  return (
    <div className="bg-[#0A0E17] border border-[#171C25] rounded-2xl p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#171C25]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-[#171C25] rounded w-24" />
          <div className="h-2 bg-[#171C25] rounded w-32" />
        </div>
      </div>

      {/* Image */}
      <div className="w-full h-96 bg-[#171C25] rounded-xl mb-3" />

      {/* Actions */}
      <div className="flex items-center gap-4 mb-3">
        <div className="w-6 h-6 bg-[#171C25] rounded-full" />
        <div className="w-6 h-6 bg-[#171C25] rounded-full" />
        <div className="w-6 h-6 bg-[#171C25] rounded-full" />
      </div>

      {/* Caption */}
      <div className="space-y-2">
        <div className="h-2 bg-[#171C25] rounded w-full" />
        <div className="h-2 bg-[#171C25] rounded w-3/4" />
      </div>
    </div>
  );
};

export const SkeletonStory: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-2 animate-pulse">
      <div className="w-16 h-16 rounded-full bg-[#171C25]" />
      <div className="h-2 bg-[#171C25] rounded w-12" />
    </div>
  );
};

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 9 }) => {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square bg-[#171C25] animate-pulse" />
      ))}
    </div>
  );
};

export const SkeletonProfile: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-start gap-4 p-4">
        <div className="w-20 h-20 rounded-full bg-[#171C25]" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-[#171C25] rounded w-32" />
          <div className="flex gap-4">
            <div className="h-3 bg-[#171C25] rounded w-16" />
            <div className="h-3 bg-[#171C25] rounded w-16" />
            <div className="h-3 bg-[#171C25] rounded w-16" />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="px-4 space-y-2 mb-4">
        <div className="h-2 bg-[#171C25] rounded w-full" />
        <div className="h-2 bg-[#171C25] rounded w-2/3" />
      </div>

      {/* Grid */}
      <SkeletonGrid />
    </div>
  );
};
