/**
 * Reusable EmptyState component
 * Usage:
 *   <EmptyState
 *     icon={<Inbox size={40} />}
 *     title="Không có bài viết nào"
 *     description="Hãy theo dõi thêm người dùng để xem bài viết của họ."
 *     action={{ label: 'Khám phá', onClick: () => navigate('/search') }}
 *   />
 */
export default function EmptyState({ icon, title, description, action, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-8 px-4' : 'py-16 px-6'
      }`}
    >
      {icon && (
        <div
          className={`flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4 ${
            compact ? 'w-12 h-12' : 'w-16 h-16'
          }`}
        >
          {icon}
        </div>
      )}

      {title && (
        <h3
          className={`font-semibold text-slate-800 ${
            compact ? 'text-sm mb-1' : 'text-base mb-2'
          }`}
        >
          {title}
        </h3>
      )}

      {description && (
        <p
          className={`text-slate-500 leading-relaxed max-w-xs ${
            compact ? 'text-xs' : 'text-sm'
          }`}
        >
          {description}
        </p>
      )}

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 px-5 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
