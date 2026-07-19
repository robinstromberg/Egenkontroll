import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  avvikelserFactPage,
  dokumentationEgenkontrollFactPage,
  faroanalysFactPage,
  kontrollplanFactPage,
  kritiskaGransvardenFactPage,
  verifieringHaccpFactPage,
  type FactPageContent,
} from './factPages';
import {
  personalHygieneArticle,
  type MigratedKnowledgeArticleContent,
} from './migratedKnowledgeArticles';
import {
  cafeBusinessPage,
  cateringBusinessPage,
  kioskFoodtruckBusinessPage,
  restaurantBusinessPage,
  type BusinessPageContent,
} from './businessPages';
import { controlPlanTemplatePage } from './templatePages';
import { hazardAnalysisToolContent } from './toolPages';
import { haccpTopicContent } from './haccpTopicContent';

const siteOrigin = 'https://minegenkontroll.se';
const seoDirectory = new URL('../../public/seo/', import.meta.url);
const baselineUrl = new URL('../../../../scripts/contracts/public-platform-baseline.json', import.meta.url);

type Baseline = {
  publicRoutes: string[];
  canonicalPaths: string[];
  sitemapPaths: string[];
};

export type WebPageKey =
  | 'home'
  | 'knowledge-base'
  | 'search'
  | 'haccp-hub'
  | 'fact-page'
  | 'template-page'
  | 'hazard-tool'
  | 'business-page'
  | 'seo-landing'
  | 'privacy'
  | 'terms'
  | 'static-seo';

export type WebRoute = {
  path: string;
  canonicalPath: string | null;
  canonicalPolicy: 'required' | 'legacy-none';
  title: string;
  description: string;
  robots: 'index, follow' | 'noindex, follow';
  page: WebPageKey;
  shell: 'modern' | 'legacy' | 'static';
  shellClass?: string;
  source: string;
  inSitemap: boolean;
  structuredData?: {
    kind: 'article';
    citation: string;
    breadcrumb: readonly { label: string; href?: string }[];
  };
};

const baseline = JSON.parse(readFileSync(baselineUrl, 'utf8')) as Baseline;
const sitemapPaths = new Set(baseline.sitemapPaths);

const homepageMetadata = {
  title: 'Min Egenkontroll | Praktisk hjälp och digital dokumentation',
  description: 'Praktisk hjälp med egenkontroll för små livsmedelsverksamheter – kunskap, resurser och en app för att dokumentera vardagens kontroller.',
};

function modernRoute(route: Omit<WebRoute, 'inSitemap'>): WebRoute {
  return { ...route, inSitemap: sitemapPaths.has(route.path) };
}

function factPageRoute(
  content: FactPageContent | MigratedKnowledgeArticleContent,
  source: string,
): WebRoute {
  return modernRoute({
    path: content.canonicalPath,
    canonicalPath: content.canonicalPath,
    canonicalPolicy: 'required',
    title: content.title,
    description: content.description,
    robots: 'index, follow',
    page: 'fact-page',
    shell: 'modern',
    shellClass: 'fact-page',
    source,
    structuredData: { kind: 'article', citation: content.source.url, breadcrumb: content.breadcrumb },
  });
}

function businessPageRoute(content: BusinessPageContent, source: string): WebRoute {
  return modernRoute({
    path: content.canonicalPath,
    canonicalPath: content.canonicalPath,
    canonicalPolicy: 'required',
    title: content.title,
    description: content.description,
    robots: 'index, follow',
    page: 'business-page',
    shell: 'modern',
    shellClass: 'business-page',
    source,
  });
}

const modernRoutes: WebRoute[] = [
  modernRoute({ path: '/', canonicalPath: '/', canonicalPolicy: 'required', ...homepageMetadata, robots: 'index, follow', page: 'home', shell: 'modern', source: 'src/components/Homepage.tsx' }),
  modernRoute({ path: '/kunskapsbank', canonicalPath: '/kunskapsbank', canonicalPolicy: 'required', title: 'Kunskapsbank om egenkontroll och livsmedelssäkerhet | Min Egenkontroll', description: 'Guider om egenkontroll, hygien, lokaler, märkning, livsmedelsinformation, temperatur, datummärkning, HACCP och spårbarhet för livsmedelsföretag.', robots: 'index, follow', page: 'knowledge-base', shell: 'modern', source: 'src/components/KnowledgeBasePage.tsx' }),
  modernRoute({ path: '/sok', canonicalPath: '/sok', canonicalPolicy: 'required', title: 'Sök i Min Egenkontroll', description: 'Sök bland vägledning och resurser från Min Egenkontroll.', robots: 'noindex, follow', page: 'search', shell: 'legacy', source: 'src/components/SearchResultsPage.tsx' }),
  modernRoute({ path: '/haccp-sma-livsmedelsforetag', canonicalPath: '/haccp-sma-livsmedelsforetag', canonicalPolicy: 'required', title: haccpTopicContent.title, description: haccpTopicContent.description, robots: 'index, follow', page: 'haccp-hub', shell: 'modern', shellClass: 'haccp-page', source: 'src/config/haccpTopicContent.ts' }),
  factPageRoute(faroanalysFactPage, 'src/config/factPages.ts#faroanalysFactPage'),
  factPageRoute(kontrollplanFactPage, 'src/config/factPages.ts#kontrollplanFactPage'),
  factPageRoute(kritiskaGransvardenFactPage, 'src/config/factPages.ts#kritiskaGransvardenFactPage'),
  factPageRoute(avvikelserFactPage, 'src/config/factPages.ts#avvikelserFactPage'),
  factPageRoute(verifieringHaccpFactPage, 'src/config/factPages.ts#verifieringHaccpFactPage'),
  factPageRoute(dokumentationEgenkontrollFactPage, 'src/config/factPages.ts#dokumentationEgenkontrollFactPage'),
  factPageRoute(personalHygieneArticle, 'src/config/migratedKnowledgeArticles.ts#personalHygieneArticle'),
  modernRoute({ path: controlPlanTemplatePage.canonicalPath, canonicalPath: controlPlanTemplatePage.canonicalPath, canonicalPolicy: 'required', title: controlPlanTemplatePage.title, description: controlPlanTemplatePage.description, robots: 'index, follow', page: 'template-page', shell: 'modern', shellClass: 'template-page', source: 'src/config/templatePages.ts#controlPlanTemplatePage' }),
  modernRoute({ path: hazardAnalysisToolContent.canonicalPath, canonicalPath: hazardAnalysisToolContent.canonicalPath, canonicalPolicy: 'required', title: hazardAnalysisToolContent.title, description: hazardAnalysisToolContent.description, robots: 'index, follow', page: 'hazard-tool', shell: 'modern', shellClass: 'hazard-tool', source: 'src/config/toolPages.ts#hazardAnalysisToolContent' }),
  businessPageRoute(restaurantBusinessPage, 'src/config/businessPages.ts#restaurantBusinessPage'),
  businessPageRoute(cafeBusinessPage, 'src/config/businessPages.ts#cafeBusinessPage'),
  businessPageRoute(kioskFoodtruckBusinessPage, 'src/config/businessPages.ts#kioskFoodtruckBusinessPage'),
  businessPageRoute(cateringBusinessPage, 'src/config/businessPages.ts#cateringBusinessPage'),
  modernRoute({ path: '/digital-egenkontroll-livsmedel', canonicalPath: '/digital-egenkontroll-livsmedel', canonicalPolicy: 'required', title: 'Digital egenkontroll för livsmedelsverksamheter | Min Egenkontroll', description: 'Samla temperaturkontroller, städning, datummärkning, varumottagning, spårbarhet och avvikelser digitalt i mobilen.', robots: 'index, follow', page: 'seo-landing', shell: 'legacy', source: 'src/components/SeoLandingPage.tsx#digital-egenkontroll-livsmedel' }),
  modernRoute({ path: '/sparbarhet-livsmedel', canonicalPath: '/sparbarhet-livsmedel', canonicalPolicy: 'required', title: 'Spårbarhet för livsmedelsföretag – vad behöver sparas? | Min Egenkontroll', description: 'Läs vad spårbarhet innebär för restaurang, café och andra livsmedelsföretag: leverantörer, mottagare, leveranser och dokumentation.', robots: 'index, follow', page: 'seo-landing', shell: 'legacy', source: 'src/components/SeoLandingPage.tsx#sparbarhet-livsmedel' }),
  modernRoute({ path: '/verifiering-egenkontroll-livsmedel', canonicalPath: '/verifiering-egenkontroll-livsmedel', canonicalPolicy: 'required', title: 'Verifiering av egenkontrollen – fungerar rutinerna? | Min Egenkontroll', description: 'Vad betyder verifiering i HACCP och egenkontroll? Läs hur verksamheten kan kontrollera att övervakning, journaler och korrigerande åtgärder fungerar.', robots: 'index, follow', page: 'seo-landing', shell: 'legacy', source: 'src/components/SeoLandingPage.tsx#verifiering-egenkontroll-livsmedel' }),
  modernRoute({ path: '/spara-sparbarhetsuppgifter-livsmedel', canonicalPath: '/spara-sparbarhetsuppgifter-livsmedel', canonicalPolicy: 'required', title: 'Hur länge ska spårbarhetsuppgifter sparas? | Min Egenkontroll', description: 'Hur länge bör spårbarhetsuppgifter för livsmedel sparas? Läs om Livsmedelsverkets vägledning och EU-kommissionens rekommendationer för olika produkter.', robots: 'index, follow', page: 'seo-landing', shell: 'legacy', source: 'src/components/SeoLandingPage.tsx#spara-sparbarhetsuppgifter-livsmedel' }),
  modernRoute({ path: '/integritetspolicy', canonicalPath: null, canonicalPolicy: 'legacy-none', ...homepageMetadata, robots: 'index, follow', page: 'privacy', shell: 'legacy', source: 'src/components/PrivacyPolicyPage.tsx' }),
  modernRoute({ path: '/anvandarvillkor', canonicalPath: null, canonicalPolicy: 'legacy-none', ...homepageMetadata, robots: 'index, follow', page: 'terms', shell: 'legacy', source: 'src/components/TermsPage.tsx' }),
];

function extract(html: string, pattern: RegExp, label: string, fileName: string): string {
  const value = html.match(pattern)?.[1]?.trim();
  if (!value) throw new Error(`Statisk SEO-fil saknar ${label}: ${fileName}`);
  return value;
}

const staticSeoRoutes: WebRoute[] = readdirSync(seoDirectory)
  .filter((fileName) => fileName.endsWith('.html'))
  .sort((left, right) => left.localeCompare(right, 'sv'))
  .map((fileName) => {
    const html = readFileSync(new URL(fileName, seoDirectory), 'utf8');
    const path = `/seo/${fileName}`;
    const canonicalUrl = extract(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i, 'canonical', fileName);
    const canonicalPath = new URL(canonicalUrl).pathname;
    return {
      path,
      canonicalPath,
      canonicalPolicy: 'required',
      title: extract(html, /<title>([^<]+)<\/title>/i, 'title', fileName),
      description: extract(html, /<meta\s+name="description"\s+content="([^"]+)"/i, 'description', fileName),
      robots: 'index, follow',
      page: 'static-seo',
      shell: 'static',
      source: `public/seo/${fileName}`,
      inSitemap: sitemapPaths.has(path),
    } satisfies WebRoute;
  });

export const appOwnedCompatibilityRoutes = ['/login', '/signup'] as const;
export const webRouteRegistry = [...modernRoutes, ...staticSeoRoutes] as const satisfies readonly WebRoute[];
export const webModernRoutes = modernRoutes as readonly WebRoute[];
export const webStaticSeoRoutes = staticSeoRoutes as readonly WebRoute[];
export const webOriginalSeoRoutes = webRouteRegistry.filter((route) => /^\/seo\/[^/]+\.html$/.test(route.path));
export const webSitemapRoutes = webRouteRegistry.filter((route) => route.inSitemap);

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

function compareSets(label: string, actual: readonly string[], expected: readonly string[], errors: string[]) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  for (const value of expectedSet) if (!actualSet.has(value)) errors.push(`Saknad ${label}: ${value}`);
  for (const value of actualSet) if (!expectedSet.has(value)) errors.push(`Oväntad ${label}: ${value}`);
}

export function validateWebRouteRegistry(): string[] {
  const errors: string[] = [];
  const paths = webRouteRegistry.map((route) => route.path);
  const canonicals = webRouteRegistry.flatMap((route) => route.canonicalPath ? [route.canonicalPath] : []);
  const expectedPaths = baseline.publicRoutes.filter((path) => !appOwnedCompatibilityRoutes.includes(path as typeof appOwnedCompatibilityRoutes[number]));
  const expectedSeoPaths = baseline.publicRoutes.filter((path) => /^\/seo\/[^/]+\.html$/.test(path));

  for (const path of duplicates(paths)) errors.push(`Duplicerad Astro-route: ${path}`);
  for (const path of duplicates(canonicals)) errors.push(`Duplicerad Astro-canonical: ${path}`);
  for (const route of webRouteRegistry) {
    if (!route.path.startsWith('/')) errors.push(`Route måste börja med /: ${route.path}`);
    if (!route.title.trim()) errors.push(`Route saknar title: ${route.path}`);
    if (!route.description.trim()) errors.push(`Route saknar description: ${route.path}`);
    if (route.canonicalPolicy === 'required' && !route.canonicalPath) errors.push(`Route saknar canonical: ${route.path}`);
    if (route.canonicalPath && route.canonicalPath !== route.path) errors.push(`Canonical avviker från route: ${route.path} -> ${route.canonicalPath}`);
  }

  compareSets('publik webbroute', paths, expectedPaths, errors);
  compareSets('canonical path', canonicals, baseline.canonicalPaths, errors);
  compareSets('sitemap-path', webSitemapRoutes.map((route) => route.path), baseline.sitemapPaths, errors);
  compareSets('ursprunglig SEO-route', webOriginalSeoRoutes.map((route) => route.path), expectedSeoPaths, errors);
  if (webOriginalSeoRoutes.length !== 55) errors.push(`Förväntade 55 ursprungliga SEO-rutter men hittade ${webOriginalSeoRoutes.length}.`);
  return errors;
}

export function assertWebRouteRegistry() {
  const errors = validateWebRouteRegistry();
  if (errors.length > 0) throw new Error(`Astro-registret bryter webbkontraktet:\n- ${errors.join('\n- ')}`);
}

assertWebRouteRegistry();

export const routeRegistrySource = fileURLToPath(import.meta.url);
export { siteOrigin };
