// Skeleton primitives with shimmer animation

const shimmerClass =
  'rounded-md bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:300%_100%] animate-shimmer';

export function Skeleton({ className = '' }) {
  return <div className={`${shimmerClass} ${className}`} />;
}

export function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="w-28 h-3.5" />
          <Skeleton className="w-16 h-2.5" />
        </div>
        <Skeleton className="w-5 h-5 rounded-full" />
      </div>
      {/* Media */}
      <Skeleton className="w-full h-60 rounded-none" />
      {/* Actions */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex gap-4">
          <Skeleton className="w-7 h-7 rounded-full" />
          <Skeleton className="w-7 h-7 rounded-full" />
          <Skeleton className="w-7 h-7 rounded-full" />
        </div>
        <Skeleton className="w-7 h-7 rounded-full" />
      </div>
      {/* Caption */}
      <div className="px-4 pb-4 space-y-2">
        <Skeleton className="w-3/4 h-3" />
        <Skeleton className="w-1/2 h-3" />
      </div>
    </div>
  );
}

export function StorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-full" />
      <Skeleton className="w-12 h-2.5" />
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <Skeleton className="w-1/3 h-3.5" />
        <Skeleton className="w-2/3 h-3" />
      </div>
      <Skeleton className="w-8 h-2.5" />
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <Skeleton className="w-4/5 h-3" />
        <Skeleton className="w-2/5 h-2.5" />
      </div>
      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4">
      {/* Cover */}
      <Skeleton className="w-full h-44 rounded-2xl" />
      {/* Avatar + info */}
      <div className="px-4 flex items-end gap-4 -mt-16">
        <Skeleton className="w-24 h-24 rounded-full ring-4 ring-white flex-shrink-0" />
        <div className="flex-1 space-y-2 pb-2">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-24 h-3.5" />
        </div>
        <Skeleton className="w-24 h-9 rounded-xl" />
      </div>
      {/* Stats */}
      <div className="flex gap-6 px-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="space-y-1">
            <Skeleton className="w-12 h-4" />
            <Skeleton className="w-16 h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function UserRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5 min-w-0">
        <Skeleton className="w-1/3 h-3.5" />
        <Skeleton className="w-1/4 h-2.5" />
      </div>
      <Skeleton className="w-20 h-8 rounded-xl" />
    </div>
  );
}

export default Skeleton;
