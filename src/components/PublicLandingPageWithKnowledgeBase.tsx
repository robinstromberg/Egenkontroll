import { Homepage } from './Homepage';
import { HaccpTopicHub } from './HaccpTopicHub';
import { KnowledgeBasePage } from './KnowledgeBasePage';
import { SearchResultsPage } from './SearchResultsPage';
import { SeoLandingPage, getSeoPageSlugFromPath } from './SeoLandingPage';

type PublicLandingPageProps = {
  onStartTrial: () => void;
  onLogin: () => void;
};

export function PublicLandingPage(props: PublicLandingPageProps) {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/kunskapsbank') return <KnowledgeBasePage />;
  if (normalizedPath === '/sok') return <SearchResultsPage />;
  if (normalizedPath === '/haccp-sma-livsmedelsforetag') return <HaccpTopicHub {...props} />;
  const seoPage = getSeoPageSlugFromPath(window.location.pathname);
  if (seoPage) return <SeoLandingPage page={seoPage} />;
  return <Homepage {...props} />;
}
