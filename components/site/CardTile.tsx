import Link from 'next/link';
import { cn } from '@/lib/ui/cn';

interface CardTileProps {
  title: string;
  href: string;
  desc?: string;
  onClick?: () => void;
}

export function CardTile({ title, href, desc, onClick }: CardTileProps) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'block w-full text-left rounded-2xl border border-zinc-200/60 dark:border-zinc-800',
          'p-6 shadow-sm hover:shadow-md transition',
        )}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        {desc ? <p className="text-sm text-zinc-500 mt-1">{desc}</p> : null}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'block rounded-2xl border border-zinc-200/60 dark:border-zinc-800',
        'p-6 shadow-sm hover:shadow-md transition',
      )}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      {desc ? <p className="text-sm text-zinc-500 mt-1">{desc}</p> : null}
    </Link>
  );
}
