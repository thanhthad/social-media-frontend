const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`}></div>
  );
};

export const PostSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-20 h-3" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-5/6 h-4" />
      <Skeleton className="w-4/6 h-4" />
    </div>
    <Skeleton className="w-full h-48 rounded-xl" />
  </div>
);

export const ConversationSkeleton = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="w-12 h-12 rounded-full" />
    <div className="space-y-2 flex-1">
      <Skeleton className="w-1/2 h-4" />
      <Skeleton className="w-3/4 h-3" />
    </div>
  </div>
);

export default Skeleton;
