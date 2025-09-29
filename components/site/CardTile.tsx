import Link from 'next/link';
import { cn } from '@/lib/ui/cn';

export function CardTile({
  title,
  href,
  desc,
}: {
  title: string;
  href: string;
  desc?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'block rounded-2xl border border-zinc-200/60 ',
        'p-6 shadow-sm hover:shadow-md transition'
      )}
    >
      <h3 className='text-lg font-semibold'>{title}</h3>
      {desc ? <p className='text-sm text-zinc-500 mt-1'>{desc}</p> : null}
    </Link>
  );
}
