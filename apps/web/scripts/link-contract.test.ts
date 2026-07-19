import assert from 'node:assert/strict';
import test from 'node:test';
import { validateDocumentLinks, type LinkDocument } from './link-contract';

const contract = {
  siteOrigin: 'https://minegenkontroll.se',
  appOrigin: 'https://app.minegenkontroll.se',
  appUrls: ['https://app.minegenkontroll.se/login', 'https://app.minegenkontroll.se/signup'],
  redirectSources: ['/login', '/signup'],
  routePaths: ['/', '/guide', '/seo/legacy.html'],
} as const;

function errors(documents: LinkDocument[]) {
  return validateDocumentLinks(documents, contract).errors;
}

test('godkänner exakta routes, fragment, app-URL och legacyredirect', () => {
  const result = validateDocumentLinks([
    { route: '/', page: 'home', html: '<main id="how"><a href="#how"></a><a href="/guide#answer"></a><a href="https://app.minegenkontroll.se/signup"></a></main>' },
    { route: '/guide', page: 'fact-page', html: '<h2 id="answer"></h2>' },
    { route: '/seo/legacy.html', page: 'static-seo', html: '<a href="/signup"></a>' },
  ], contract);
  assert.deepEqual(result.errors, []);
  assert.equal(result.legacyRedirectLinks, 1);
});

test('avvisar saknad route, saknat fragment och relativ modern authroute', () => {
  const result = errors([
    { route: '/', page: 'home', html: '<a href="/missing"></a><a href="/guide#missing"></a><a href="/login"></a>' },
    { route: '/guide', page: 'fact-page', html: '<h1>Guide</h1>' },
  ]);
  assert.equal(result.length, 3);
});

test('avvisar fel app-path, query och routevarianter', () => {
  const result = errors([{ route: '/', page: 'home', html: [
    '<a href="https://app.minegenkontroll.se/unknown"></a>',
    '<a href="https://app.minegenkontroll.se/signup?unexpected=1"></a>',
    '<a href="/guide/"></a>',
    '<a href="/guide.html"></a>',
    '<a href="legacy.html"></a>',
  ].join('') }]);
  assert.equal(result.length, 5);
  assert.ok(result.some((error) => error.includes('/guide/')));
  assert.ok(result.some((error) => error.includes('/guide.html')));
  assert.ok(result.some((error) => error.includes('/legacy.html')));
});
