// lib/dev.ts
export const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === '1';

export const fakeUser = {
  id: '00000000-0000-0000-0000-DEVUSER000001',
  email: 'dev@local',
};

// 7 ngày gần đây để vẽ chart
export function mockSeries7d(min = 90, max = 160) {
  const out: { d: string; v: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000);
    out.push({
      d: day.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
      v: Math.round(min + Math.random() * (max - min)),
    });
  }
  return out;
}