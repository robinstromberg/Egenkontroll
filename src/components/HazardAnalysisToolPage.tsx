import { useEffect, useRef, useState } from 'react';
import type { HazardAnalysisToolContent } from '../config/toolPages';
import type { HazardDraft, HazardType, ProcessStepDraft, UserAssessment } from '../types/publicTools';
import { PublicSiteShell } from './PublicSiteShell';
import { Button, LinkButton } from '@min-egenkontroll/design-system';
import './HazardAnalysisToolPage.css';

const siteUrl = 'https://minegenkontroll.se';

type HazardAnalysisToolPageProps = {
  content: HazardAnalysisToolContent;
  onLogin: () => void;
  onStartTrial: () => void;
};

function newHazard(id: number): HazardDraft {
  return { id, name: '', type: '', likelihood: '', severity: '', controlMeasure: '', relevant: '', significant: '', reasoning: '', followUp: '', deviationHandling: '' };
}

function setMeta(selector: string, value: string) {
  const element = document.head.querySelector<HTMLMetaElement>(selector);
  if (element) element.content = value;
}

function setPageMetadata(content: HazardAnalysisToolContent) {
  const canonical = `${siteUrl}${content.canonicalPath}`;
  document.title = content.title;
  setMeta('meta[name="description"]', content.description);
  setMeta('meta[name="robots"]', 'index, follow');
  setMeta('meta[property="og:title"]', content.title);
  setMeta('meta[property="og:description"]', content.description);
  setMeta('meta[property="og:url"]', canonical);
  const link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (link) link.href = canonical;
}

function PrintValue({ value }: { value: string }) {
  return <div aria-hidden="true" className="hazard-tool__print-value">{value || '\u00a0'}</div>;
}

function TextField({ id, label, value, placeholder, help, multiline = false, onChange }: { id: string; label: string; value: string; placeholder: string; help?: string; multiline?: boolean; onChange: (value: string) => void }) {
  const helpId = help ? `${id}-help` : undefined;
  return <div className="hazard-tool__field">
    <label htmlFor={id}>{label}</label>
    {help && <span className="hazard-tool__field-help" id={helpId}>{help}</span>}
    {multiline
      ? <textarea aria-describedby={helpId} id={id} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} value={value} />
      : <input aria-describedby={helpId} id={id} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type="text" value={value} />}
    <PrintValue value={value} />
  </div>;
}

function SelectField({ id, label, value, options, help, onChange }: { id: string; label: string; value: string; options: readonly { value: string; label: string }[]; help?: string; onChange: (value: string) => void }) {
  const helpId = help ? `${id}-help` : undefined;
  const selectedLabel = options.find((option) => option.value === value)?.label ?? '';
  return <div className="hazard-tool__field">
    <label htmlFor={id}>{label}</label>
    {help && <span className="hazard-tool__field-help" id={helpId}>{help}</span>}
    <select aria-describedby={helpId} id={id} onChange={(event) => onChange(event.target.value)} value={value}>
      <option value="">Välj själv</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    <PrintValue value={selectedLabel} />
  </div>;
}

export function HazardAnalysisToolPage({ content, onLogin, onStartTrial }: HazardAnalysisToolPageProps) {
  const nextProcessId = useRef(2);
  const nextHazardId = useRef(2);
  const [processSteps, setProcessSteps] = useState<ProcessStepDraft[]>(() => [{ id: 1, name: '', description: '', hazards: [newHazard(1)] }]);

  useEffect(() => { setPageMetadata(content); }, [content]);

  function updateProcessStep(processId: number, field: 'name' | 'description', value: string) {
    setProcessSteps((current) => current.map((step) => step.id === processId ? { ...step, [field]: value } : step));
  }

  function addProcessStep() {
    const processId = nextProcessId.current++;
    const hazardId = nextHazardId.current++;
    setProcessSteps((current) => [...current, { id: processId, name: '', description: '', hazards: [newHazard(hazardId)] }]);
  }

  function removeProcessStep(processId: number) {
    setProcessSteps((current) => current.filter((step) => step.id !== processId));
  }

  function addHazard(processId: number) {
    const hazard = newHazard(nextHazardId.current++);
    setProcessSteps((current) => current.map((step) => step.id === processId ? { ...step, hazards: [...step.hazards, hazard] } : step));
  }

  function updateHazard<K extends keyof Omit<HazardDraft, 'id'>>(processId: number, hazardId: number, field: K, value: HazardDraft[K]) {
    setProcessSteps((current) => current.map((step) => step.id === processId ? { ...step, hazards: step.hazards.map((hazard) => hazard.id === hazardId ? { ...hazard, [field]: value } : hazard) } : step));
  }

  function removeHazard(processId: number, hazardId: number) {
    setProcessSteps((current) => current.map((step) => step.id === processId ? { ...step, hazards: step.hazards.filter((hazard) => hazard.id !== hazardId) } : step));
  }

  const typeOptions = content.hazardTypes.map(({ value, label }) => ({ value, label }));

  return <PublicSiteShell className="hazard-tool" onLogin={onLogin} onStartTrial={onStartTrial}>
    <main className="hazard-tool__shell" id="main-content">
      <nav className="hazard-tool__breadcrumb" aria-label="Brödsmulor">{content.breadcrumb.map((item) => item.href ? <a href={item.href} key={item.label}>{item.label}</a> : <span aria-current="page" key={item.label}>{item.label}</span>)}</nav>
      <header className="hazard-tool__intro">
        <p className="hazard-tool__eyebrow">{content.eyebrow}</p>
        <h1>{content.heading}</h1>
        <p className="hazard-tool__lead">{content.introduction}</p>
        <p className="hazard-tool__responsibility"><strong>Viktigt om din bedömning:</strong> {content.responsibilityNotice}</p>
        <p className="hazard-tool__session-note">Uppgifterna sparas inte till ett konto. Skriv ut eller spara som PDF innan du lämnar sidan.</p>
      </header>

      <section className="hazard-tool__instructions">
        <h2>{content.instructionsTitle}</h2>
        <ol>{content.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol>
      </section>

      <form className="hazard-tool__workspace" onSubmit={(event) => event.preventDefault()}>
        <header className="hazard-tool__workspace-header">
          <div><p className="hazard-tool__eyebrow">Ditt arbetsutkast</p><h2>Sammanställning av faroanalys</h2></div>
          <Button onClick={() => window.print()}>Skriv ut eller spara PDF</Button>
        </header>
        <p className="hazard-tool__print-responsibility"><strong>Ansvarsnotis:</strong> {content.responsibilityNotice}</p>

        <div className="hazard-tool__process-list">
          {processSteps.map((step, processIndex) => <fieldset className="hazard-tool__process" key={step.id}>
            <legend>{content.processStepTitle} {processIndex + 1}</legend>
            <p className="hazard-tool__section-help">{content.processStepHelp}</p>
            <div className="hazard-tool__process-fields">
              <TextField id={`process-${step.id}-name`} label="Namn på processteget" onChange={(value) => updateProcessStep(step.id, 'name', value)} placeholder="Exempel: ett steg i verksamhetens eget flöde" value={step.name} />
              <TextField id={`process-${step.id}-description`} label="Vad händer i processteget?" multiline onChange={(value) => updateProcessStep(step.id, 'description', value)} placeholder="Beskriv råvaror, hantering och andra relevanta förutsättningar" value={step.description} />
            </div>

            <div className="hazard-tool__hazard-list">
              {step.hazards.map((hazard, hazardIndex) => <fieldset className="hazard-tool__hazard" key={hazard.id}>
                <legend>{content.hazardTitle} {hazardIndex + 1}</legend>
                <p className="hazard-tool__section-help">{content.hazardHelp}</p>
                <div className="hazard-tool__hazard-fields">
                  <TextField id={`hazard-${hazard.id}-name`} label="Beskriv den möjliga faran" onChange={(value) => updateHazard(step.id, hazard.id, 'name', value)} placeholder="Beskriv faran med den detaljnivå som behövs" value={hazard.name} />
                  <SelectField help="Kategorierna kommer från myndighetsvägledningen. Du väljer själv vad som passar faran." id={`hazard-${hazard.id}-type`} label="Typ av fara" onChange={(value) => updateHazard(step.id, hazard.id, 'type', value as HazardType)} options={typeOptions} value={hazard.type} />
                  <TextField help="Beskriv med egna ord. Verktyget sätter inget poängvärde." id={`hazard-${hazard.id}-likelihood`} label="Hur sannolik bedömer du att faran är?" multiline onChange={(value) => updateHazard(step.id, hazard.id, 'likelihood', value)} placeholder="Beskriv vad som påverkar sannolikheten i detta steg" value={hazard.likelihood} />
                  <TextField help="Beskriv möjlig negativ hälsoeffekt. Verktyget graderar inte svaret." id={`hazard-${hazard.id}-severity`} label="Hur allvarlig bedömer du att effekten kan vara?" multiline onChange={(value) => updateHazard(step.id, hazard.id, 'severity', value)} placeholder="Beskriv vad som påverkar allvarligheten" value={hazard.severity} />
                  <TextField id={`hazard-${hazard.id}-control`} label="Möjlig kontrollåtgärd" multiline onChange={(value) => updateHazard(step.id, hazard.id, 'controlMeasure', value)} placeholder="Beskriv hur faran kan förebyggas, elimineras eller reduceras" value={hazard.controlMeasure} />
                  <SelectField help="Detta är ditt val, inte verktygets slutsats." id={`hazard-${hazard.id}-relevant`} label="Bedömer du faran som relevant här?" onChange={(value) => updateHazard(step.id, hazard.id, 'relevant', value as UserAssessment)} options={content.assessmentOptions} value={hazard.relevant} />
                  <SelectField help="Gör valet först efter ditt eget resonemang. Verktyget räknar inte fram ett svar." id={`hazard-${hazard.id}-significant`} label="Bedömer du faran som betydande?" onChange={(value) => updateHazard(step.id, hazard.id, 'significant', value as UserAssessment)} options={content.assessmentOptions} value={hazard.significant} />
                  <TextField id={`hazard-${hazard.id}-reasoning`} label="Motivering till din bedömning" multiline onChange={(value) => updateHazard(step.id, hazard.id, 'reasoning', value)} placeholder="Koppla ihop processteget, faran, sannolikheten, allvarligheten och kontrollåtgärden" value={hazard.reasoning} />
                  <TextField id={`hazard-${hazard.id}-follow-up`} label="Hur följs kontrollåtgärden upp?" multiline onChange={(value) => updateHazard(step.id, hazard.id, 'followUp', value)} placeholder="Beskriv vad som kontrolleras och hur arbetssättet följs upp" value={hazard.followUp} />
                  <TextField id={`hazard-${hazard.id}-deviation`} label="Vad görs vid en avvikelse?" multiline onChange={(value) => updateHazard(step.id, hazard.id, 'deviationHandling', value)} placeholder="Beskriv verksamhetens planerade hantering av produkt och process" value={hazard.deviationHandling} />
                </div>
                <Button className="hazard-tool__remove" onClick={() => removeHazard(step.id, hazard.id)} variant="ghost">Ta bort fara</Button>
              </fieldset>)}
            </div>

            <div className="hazard-tool__process-actions">
              <Button onClick={() => addHazard(step.id)} variant="secondary">Lägg till fara</Button>
              <Button className="hazard-tool__remove" onClick={() => removeProcessStep(step.id)} variant="ghost">Ta bort processteg</Button>
            </div>
          </fieldset>)}
        </div>

        {processSteps.length === 0 && <p className="hazard-tool__empty">Inga processteg finns i utkastet. Lägg till ett processteg för att fortsätta.</p>}
        <div className="hazard-tool__workspace-actions"><Button onClick={addProcessStep} variant="secondary">Lägg till processteg</Button><Button onClick={() => window.print()}>Skriv ut eller spara PDF</Button></div>
      </form>

      <section className="hazard-tool__sources">
        <h2>{content.sources.title}</h2>
        <dl><div><dt>Källtyp</dt><dd>{content.sources.type}</dd></div><div><dt>Faktagranskad</dt><dd>{content.sources.factCheckedAt}</dd></div></dl>
        {content.sources.links.map((source) => <p key={source.url}><a href={source.url}>{source.label}</a></p>)}
        <p>{content.sources.limitation}</p>
      </section>

      <section className="hazard-tool__related"><h2>Fortsätt med rätt underlag</h2><div>{content.relatedLinks.map((link) => <article key={link.href}><h3><a href={link.href}>{link.title}</a></h3><p>{link.copy}</p></article>)}</div></section>
      <section className="hazard-tool__app"><p className="hazard-tool__eyebrow">{content.appBridge.eyebrow}</p><h2>{content.appBridge.title}</h2><p>{content.appBridge.copy}</p><LinkButton href={content.appBridge.href} variant="ghost">{content.appBridge.linkLabel}</LinkButton></section>
    </main>
  </PublicSiteShell>;
}
