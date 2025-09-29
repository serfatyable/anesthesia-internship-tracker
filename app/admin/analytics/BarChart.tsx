'use client';

export default function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 100);
  return (
    <svg width={180} height={80} className="block">
      {data.map((val, i) => (
        <g key={i}>
          <rect
            x={i * 50 + 10}
            y={80 - (val / max) * 60 - 10}
            width={30}
            height={(val / max) * 60}
            fill="#2563eb"
            rx={4}
          />
          <text x={i * 50 + 25} y={75} textAnchor="middle" fontSize={10}>
            {labels[i]?.split(' ')[0]}
          </text>
          <text
            x={i * 50 + 25}
            y={80 - (val / max) * 60 - 15}
            textAnchor="middle"
            fontSize={10}
            fill="#2563eb"
          >
            {val}%
          </text>
        </g>
      ))}
    </svg>
  );
}
