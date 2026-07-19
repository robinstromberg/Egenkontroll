import { parse } from 'parse5';

type HtmlNode = {
  nodeName: string;
  attrs?: { name: string; value: string }[];
  childNodes?: HtmlNode[];
};

export type LinkDocument = {
  route: string;
  page: string;
  html: string;
};

export type LinkContract = {
  siteOrigin: string;
  appOrigin: string;
  appUrls: readonly string[];
  redirectSources: readonly string[];
  routePaths: readonly string[];
};

export type LinkResult = {
  errors: string[];
  checkedLinks: number;
  legacyRedirectLinks: number;
};

function inspectHtml(html: string) {
  const root = parse(html) as unknown as HtmlNode;
  const ids = new Set<string>();
  const links: string[] = [];

  function visit(node: HtmlNode) {
    const attributes = new Map(node.attrs?.map(({ name, value }) => [name, value]));
    const id = attributes.get('id') ?? (node.nodeName === 'a' ? attributes.get('name') : undefined);
    if (id) ids.add(id);
    if (node.nodeName === 'a' || node.nodeName === 'area') {
      const href = attributes.get('href');
      if (href) links.push(href);
    }
    if (node.nodeName === 'form') {
      const action = attributes.get('action');
      if (action) links.push(action);
    }
    node.childNodes?.forEach(visit);
  }

  visit(root);
  return { ids, links };
}

export function validateDocumentLinks(documents: readonly LinkDocument[], contract: LinkContract): LinkResult {
  const errors: string[] = [];
  const routePaths = new Set(contract.routePaths);
  const redirectSources = new Set(contract.redirectSources);
  const appUrls = new Set(contract.appUrls);
  const inspected = new Map(documents.map((document) => [document.route, inspectHtml(document.html)]));
  let checkedLinks = 0;
  let legacyRedirectLinks = 0;

  for (const document of documents) {
    const source = inspected.get(document.route)!;
    for (const rawHref of source.links) {
      if (/^(?:mailto:|tel:)/i.test(rawHref)) continue;
      checkedLinks += 1;
      let target: URL;
      try {
        target = new URL(rawHref, new URL(document.route, contract.siteOrigin));
      } catch {
        errors.push(`${document.route}: ogiltig länk ${JSON.stringify(rawHref)}`);
        continue;
      }

      if (target.origin === contract.appOrigin) {
        const withoutFragment = `${target.origin}${target.pathname}${target.search}`;
        if (!appUrls.has(withoutFragment) || target.hash) errors.push(`${document.route}: okänd app-URL ${target.href}`);
        continue;
      }
      if (target.origin !== contract.siteOrigin) continue;

      const pathname = target.pathname;
      if (redirectSources.has(pathname)) {
        if (document.page !== 'static-seo') errors.push(`${document.route}: modern sida använder relativ app-route ${pathname}`);
        else legacyRedirectLinks += 1;
        continue;
      }
      const currentDocumentAnchor = pathname === document.route && inspected.has(pathname);
      if (!routePaths.has(pathname) && !currentDocumentAnchor) {
        errors.push(`${document.route}: okänd intern route ${pathname} från ${JSON.stringify(rawHref)}`);
        continue;
      }
      if (target.hash) {
        const id = decodeURIComponent(target.hash.slice(1));
        if (!inspected.get(pathname)?.ids.has(id)) errors.push(`${document.route}: fragment #${id} saknas på ${pathname}`);
      }
    }
  }

  return { errors, checkedLinks, legacyRedirectLinks };
}
