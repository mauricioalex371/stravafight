import { SearchService } from '../../services/searchService';

export function runSearchTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err?.message || String(err) });
    }
  }

  test('SearchService should return empty array for empty search and no filters', () => {
    const hits = SearchService.search('', 'TUDO', 'TODAS');
    if (hits.length !== 0) throw new Error(`Expected 0 hits, got ${hits.length}`);
  });

  test('SearchService should find athletes by modality or name', () => {
    const hits = SearchService.search('Uarlei', 'TUDO', 'TODAS');
    const foundMaster = hits.some((h) => h.title.includes('Uarlei'));
    if (!foundMaster) throw new Error('Did not find Mestre Uarlei in search');
  });

  test('SearchService should filter results by selected category', () => {
    const hits = SearchService.search('Jiu-Jitsu', 'EVENTOS', 'TODAS');
    const allEvents = hits.every((h) => h.type === 'EVENT');
    if (!allEvents) throw new Error('Found non-event hits when filtering by EVENTOS');
  });

  return results;
}
