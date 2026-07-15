import { Homepage } from './Homepage';
import { HaccpTopicHub } from './HaccpTopicHub';
import { FactPage } from './FactPage';
import { avvikelserFactPage, dokumentationEgenkontrollFactPage, faroanalysFactPage, kontrollplanFactPage, kritiskaGransvardenFactPage, verifieringHaccpFactPage } from '../config/factPages';
import { TemplatePage } from './TemplatePage';
import { controlPlanTemplatePage } from '../config/templatePages';
import { HazardAnalysisToolPage } from './HazardAnalysisToolPage';
import { hazardAnalysisToolContent } from '../config/toolPages';
import { BusinessPage } from './BusinessPage';
import { restaurantBusinessPage } from '../config/businessPages';
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
  if (normalizedPath === '/faroanalys-livsmedel') return <FactPage content={faroanalysFactPage} {...props} />;
  if (normalizedPath === '/kontrollplan-livsmedel') return <FactPage content={kontrollplanFactPage} {...props} />;
  if (normalizedPath === '/kritiska-gransvarden-livsmedel') return <FactPage content={kritiskaGransvardenFactPage} {...props} />;
  if (normalizedPath === '/avvikelser-korrigerande-atgarder-livsmedel') return <FactPage content={avvikelserFactPage} {...props} />;
  if (normalizedPath === '/verifiering-haccp-livsmedel') return <FactPage content={verifieringHaccpFactPage} {...props} />;
  if (normalizedPath === '/dokumentation-egenkontroll-livsmedel') return <FactPage content={dokumentationEgenkontrollFactPage} {...props} />;
  if (normalizedPath === '/mall-kontrollplan-livsmedel') return <TemplatePage content={controlPlanTemplatePage} {...props} />;
  if (normalizedPath === '/verktyg-faroanalys-livsmedel') return <HazardAnalysisToolPage content={hazardAnalysisToolContent} {...props} />;
  if (normalizedPath === '/egenkontroll-restaurang') return <BusinessPage content={restaurantBusinessPage} {...props} />;
  const seoPage = getSeoPageSlugFromPath(window.location.pathname);
  if (seoPage) return <SeoLandingPage page={seoPage} />;
  return <Homepage {...props} />;
}
