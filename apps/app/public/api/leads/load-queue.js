import { loadRows } from './source.js';
import { drawQueue } from './render-read.js';

export async function loadQueue() {
  const rows = await loadRows();
  drawQueue(document.querySelector('#business-list'), rows);
  document.querySelector('#result-count').textContent = `${rows.length.toLocaleString('sv-SE')} aktuella`;
}
