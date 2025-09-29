import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/health/route';

describe('Health API Integration', () => {
  it('should return 200 with health status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'healthy');
    expect(data).toHaveProperty('timestamp');
  });
});
