import { cn } from '../../lib/utils';

/**
 * Reusable Avatar component with:
 * - Gradient story ring (optional)
 * - Fallback initials
 * - Size variants: xs | sm | md | lg | xl | 2xl
 * - Online indicator
 */

const SIZE_MAP = {
  xs:  { wrapper: 'w-7 h-7',   img: 'w-7 h-7',   ring: 'p-[1.5px]', inner: 'p-[1.5px]', text: 'text-[9px]' },
  sm:  { wrapper: 'w-8 h-8',   img: 'w-8 h-8',   ring: 'p-[2px]',   inner: 'p-[1.5px]', text: 'text-[10px]' },
  md:  { wrapper: 'w-10 h-10', img: 'w-10 h-10', ring: 'p-[2px]',   inner: 'p-[2px]',   text: 'text-xs' },
  lg:  { wrapper: 'w-12 h-12', img: 'w-12 h-12', ring: 'p-[2.5px]', inner: 'p-[2px]',   text: 'text-sm' },
  xl:  { wrapper: 'w-16 h-16', img: 'w-16 h-16', ring: 'p-[2.5px]', inner: 'p-[2.5px]', text: 'text-base' },
  '2xl': { wrapper: 'w-20 h-20', img: 'w-20 h-20', ring: 'p-[3px]', inner: 'p-[2.5px]', text: 'text-lg' },
};

// Generate a stable color from initials
function getInitialsColor(name) {
  const colors = [
    'bg-gradient-to-br from-violet-500 to-indigo-600',
    'bg-gradient-to-br from-indigo-500 to-blue-600',
    'bg-gradient-to-br from-rose-500 to-pink-600',
    'bg-gradient-to-br from-amber-500 to-orange-600',
    'bg-gradient-to-br from-teal-500 to-emerald-600',
    'bg-gradient-to-br from-fuchsia-500 to-purple-600',
    'bg-gradient-to-br from-sky-500 to-cyan-600',
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export default function Avatar({
  src,
  name,
  size = 'md',
  hasStory = false,
  storyViewed = false,
  showOnline = false,
  className,
  imgClassName,
}) {
  const s = SIZE_MAP[size] || SIZE_MAP.md;
  const initials = getInitials(name);
  const initBg = getInitialsColor(name);

  const avatarEl = src ? (
    <img
      src={src}
      alt={name || ''}
      className={cn('rounded-full object-cover w-full h-full', imgClassName)}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextSibling?.style?.removeProperty('display');
      }}
    />
  ) : null;

  const fallback = (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-bold select-none w-full h-full',
        initBg,
        s.text,
        src ? 'hidden' : ''
      )}
    >
      {initials}
    </div>
  );

  const content = (
    <div className={cn('relative rounded-full flex-shrink-0', s.wrapper, className)}>
      {hasStory ? (
        <div
          className={cn(
            'rounded-full w-full h-full',
            s.ring,
            storyViewed
              ? 'bg-slate-300'
              : 'bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500'
          )}
        >
          <div className={cn('rounded-full bg-white w-full h-full', s.inner)}>
            <div className="rounded-full w-full h-full overflow-hidden">
              {avatarEl}
              {fallback}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-full overflow-hidden w-full h-full">
          {avatarEl}
          {fallback}
        </div>
      )}

      {showOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
      )}
    </div>
  );

  return content;
}
