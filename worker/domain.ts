export const profileIds = ['leticia','sofia','lorenzo','ariel','alvaro'];
export function normalize(value: string) { return value.trim().replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
export function field(value: unknown, max: number, required = false): string {
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw new Error('Revisá los datos del producto.');
  return value.trim().replace(/\s+/g,' ');
}
export function emojiFor(name: string) {
  const n = normalize(name);
  const groups: [string,string][] = [['leche|yogur','🥛'],['pan|galleta','🥖'],['huevo','🥚'],['banana','🍌'],['tomate','🍅'],['manzana','🍎'],['arroz','🍚'],['pollo|carne','🍗'],['yerba|mate','🧉'],['papel|servilleta','🧻'],['queso','🧀'],['fideo|pasta','🍝'],['jabon|detergente|lavandina','🧼'],['cafe','☕'],['papa|zanahoria|verdura','🥕']];
  return groups.find(([pattern]) => new RegExp(pattern).test(n))?.[1] || '🛒';
}
