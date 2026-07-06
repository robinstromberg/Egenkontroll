import { fetchQueue } from './queue-data.js';
import { drawQueue } from './render-read.js';

export async function loadQueue() {
  const rows = await fetchQueue();
  drawQueue(document.querySelector('#business-list'), rows);
  document.querySelector('#result-count').textContent = `${rows.length.toLocaleString('sv-SE')} nya`;
}
