import { FormEvent, useEffect, useRef, useState } from 'react';
import { ActionButton } from './ui/ActionButton';
import { ControlDefinitionCanvas } from './ControlDefinitionCanvas';
import {
  createControlField,
  createControlObject,
  listControlFields,
  listControlObjects,
  setControlObjectActive,
  setControlTypeActive,
  updateControlObject,
  updateControlType,
  updateControlField,
} from '../services/controlAdminService';
import {
  formatFrequencyLabel,
  getFrequencyConfigWithWeekday,
  readWeeklyWeekday,
  weekdayOptions,
} from '../services/scheduleService';
import type {
  ControlCategory,
  ControlFieldDefinition,
  ControlFrequency,
  ControlObject,
  ControlType,
} from '../types/database';
import type { IsoWeekday } from '../services/scheduleService';
import './ControlTypeDetailView.css';

type ControlTypeDetailViewProps = {
  organizationId: string;
  controlType: ControlType;
  canManage: boolean;
  onBack: () => void;
  onChanged: () => Promise<void>;
};

const frequencyLabels: Record<ControlFrequency, string> = {
  daily: 'Dagligen',
  weekly: 'Veckovis',
  per_delivery: 'Vid leverans',
  custom: 'Anpassad',
};

const categoryLabels: Record<ControlCategory, string> = {
  temperature: 'Temperatur',
  checklist: 'Checklista',
  receiving: 'Varumottagning',
  traceability: 'Spårbarhet',
  round: 'Egenkontrollrunda',
  custom: 'Anpassad',
};

const fieldTypeLabels: Record<ControlFieldDefinition['field_type'], string> = {
  text: 'Text',
  textarea: 'Kommentar',
  number: 'Nummer',
  temperature: 'Temperatur',
  boolean: 'Ja/nej',
  ok_not_ok: 'OK/Ej OK',
  date: 'Datum',
  datetime: 'Datum och tid',
  photo: 'Foto',
  select: 'Val',
};

const fieldTypeIconPaths: Record<ControlFieldDefinition['field_type'], string> = {
  text: '/ui-icons/dokument.png',
  textarea: '/ui-icons/dokument.png',
  number: '/ui-icons/dokument.png',
  temperature: '/ui-icons/kyltemperatur.png',
  boolean: '/ui-icons/verifiering.png',
  ok_not_ok: '/ui-icons/verifiering.png',
  date: '/ui-icons/datum.png',
  datetime: '/ui-icons/datum.png',
  photo: '/ui-icons/foto.png',
  select: '/ui-icons/installningar.png',
};

const categoryIconPaths: Record<ControlCategory, string> = {
  temperature: '/ui-icons/kyltemperatur.png',
  checklist: '/ui-icons/stadning.png',
  receiving: '/ui-icons/varumottagning.png',
  traceability: '/ui-icons/sparbarhet.png',
  round: '/ui-icons/Egenkontrollrunda.png',
  custom: '/ui-icons/kontroll.svg',
};

type BuilderMode = 'point' | 'field' | 'mixed';

type BuilderCopy = {
  mode: BuilderMode;
  topbarEyebrow: string;
  previewEyebrow: string;
  previewTitle: string;
  previewCount: (activeFields: number, activeObjects: number) => string;
  fieldShortcutLabel: string;
  pointShortcutLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  fieldSummaryTitle: string;
  fieldSummaryDescription: string;
  fieldEyebrow: string;
  fieldHeading: string;
  fieldEmptyManage: string;
  fieldEmptyReadOnly: string;
  fieldFormTitle: string;
  fieldNameLabel: string;
  pointSummaryTitle: string;
  pointSummaryDescription: string;
  pointEyebrow: string;
  pointHeading: (controlTypeName: string) => string;
  pointEmptyManage: string;
  pointEmptyReadOnly: string;
  pointFormTitle: string;
  pointNameLabel: string;
  pointLocationLabel: string;
  pointLocationPlaceholder: string;
  pointLimitLabel: string;
  pointInstructionPlaceholder: string;
  pointPlaceholder: string;
};

const pointBasedBuilderCopy: BuilderCopy = {
  mode: 'point',
  topbarEyebrow: 'Bygg punktbaserad kontroll',
  previewEyebrow: 'Förhandsvisning',
  previewTitle: 'Så här möter personalen kontrollpunkterna',
  previewCount: (_activeFields, activeObjects) => `${activeObjects} kontrollpunkter`,
  fieldShortcutLabel: 'Hantera mätning',
  pointShortcutLabel: 'Lägg till kontrollpunkt',
  emptyTitle: 'Kontrollen saknar mätning',
  emptyDescription: 'Lägg till den fasta mätning eller status som varje kontrollpunkt ska dokumenteras med.',
  fieldSummaryTitle: 'Mätning och status',
  fieldSummaryDescription: 'Detta styr vad som registreras på varje kontrollpunkt, till exempel temperatur eller OK/Ej OK.',
  fieldEyebrow: 'Vad registreras?',
  fieldHeading: 'Mätning som används i kontrollen',
  fieldEmptyManage: 'Lägg till en mätning eller status. Själva kylarna, områdena eller punkterna läggs till som kontrollpunkter.',
  fieldEmptyReadOnly: 'En administratör behöver lägga till vad som ska registreras innan kontrollen kan utföras.',
  fieldFormTitle: 'Lägg till mätning eller status',
  fieldNameLabel: 'Namn på mätning',
  pointSummaryTitle: 'Lägg till eller hantera kontrollpunkter',
  pointSummaryDescription: 'Kylar, områden, produkter eller andra saker som ska kontrolleras.',
  pointEyebrow: 'Kontrollpunkter',
  pointHeading: (controlTypeName) => `Kontrollpunkter för ${controlTypeName}`,
  pointEmptyManage: 'Lägg till kontrollpunkter som personalen ska gå igenom, till exempel kylar, områden eller produkter.',
  pointEmptyReadOnly: 'En administratör behöver lägga till kontrollpunkter om kontrollen ska utföras per plats eller produkt.',
  pointFormTitle: 'Lägg till kontrollpunkt',
  pointNameLabel: 'Namn på kontrollpunkt',
  pointLocationLabel: 'Plats',
  pointLocationPlaceholder: 'Plats, frivilligt',
  pointLimitLabel: 'Maxgräns',
  pointInstructionPlaceholder: 'Instruktion för just den här kontrollpunkten, frivilligt',
  pointPlaceholder: 'Exempel: Kontrollpunkt',
};

function getBuilderCopy(controlType: ControlType): BuilderCopy {
  if (controlType.category === 'temperature') {
    return {
      ...pointBasedBuilderCopy,
      previewTitle: 'Så här fyller personalen i temperatur per kontrollpunkt',
      fieldSummaryTitle: 'Fast mätning: temperatur',
      fieldSummaryDescription: 'Temperatur är själva mätningen. Lägg till kylar och frysar som kontrollpunkter.',
      fieldHeading: 'Temperaturmätning',
      fieldEmptyManage: 'Lägg till temperaturmätningen här. Lägg sedan till kylar och frysar som kontrollpunkter.',
      fieldFormTitle: 'Lägg till mätning',
      pointSummaryDescription: 'Kylar och frysar som ska kontrolleras, med gränsvärde i °C.',
      pointEyebrow: 'Kylar och frysar',
      pointEmptyManage: 'Lägg till kylar eller frysar som personalen ska mäta, till exempel Kyl 1 - Kök.',
      pointEmptyReadOnly: 'En administratör behöver lägga till kylar eller frysar innan kontrollen kan utföras.',
      pointFormTitle: 'Lägg till kyl eller frys',
      pointNameLabel: 'Namn på kyl/frys',
      pointLocationPlaceholder: 'Plats, till exempel Kök',
      pointLimitLabel: 'Maxgräns i °C',
      pointInstructionPlaceholder: 'Instruktion för mätpunkten, till exempel mät i mitten av kylen',
      pointPlaceholder: 'Exempel: Kyl 3 - Beredning',
    };
  }

  if (controlType.category === 'traceability') {
    return {
      mode: 'field',
      topbarEyebrow: 'Bygg fältbaserad kontroll',
      previewEyebrow: 'Förhandsvisning',
      previewTitle: 'Så här fyller personalen i spårbarhetsinformationen',
      previewCount: (activeFields) => `${activeFields} informationsfält`,
      fieldShortcutLabel: 'Lägg till fält',
      pointShortcutLabel: 'Hantera punkter',
      emptyTitle: 'Kontrollen saknar informationsfält',
      emptyDescription: 'Lägg till fält som Produkt, Batchnummer, Bäst före, Leverantör eller Foto/etikett.',
      fieldSummaryTitle: 'Lägg till eller hantera informationsfält',
      fieldSummaryDescription: 'Produkt, batchnummer, bäst före, leverantör, foto och annan spårbarhetsdata.',
      fieldEyebrow: 'Informationsfält',
      fieldHeading: 'Fält som personalen fyller i',
      fieldEmptyManage: 'Lägg till minst ett informationsfält, till exempel Produkt eller Batchnummer.',
      fieldEmptyReadOnly: 'En administratör behöver lägga till informationsfält innan kontrollen kan utföras.',
      fieldFormTitle: 'Lägg till informationsfält',
      fieldNameLabel: 'Fältnamn',
      pointSummaryTitle: 'Avancerat: kontrollpunkter',
      pointSummaryDescription: 'Spårbarhet är i första hand fältbaserad. Använd punkter bara om kontrollen verkligen behöver delas upp per plats eller produkt.',
      pointEyebrow: 'Avancerade punkter',
      pointHeading: (controlTypeName) => `Eventuella punkter för ${controlTypeName}`,
      pointEmptyManage: 'Spårbarhet behöver oftast inga kontrollpunkter. Lägg bara till punkter om formuläret ska upprepas per plats eller produkt.',
      pointEmptyReadOnly: 'Den här spårbarhetskontrollen använder inga extra punkter.',
      pointFormTitle: 'Lägg till punkt',
      pointNameLabel: 'Namn på punkt',
      pointLocationLabel: 'Plats',
      pointLocationPlaceholder: 'Plats, frivilligt',
      pointLimitLabel: 'Maxgräns',
      pointInstructionPlaceholder: 'Instruktion för punkten, frivilligt',
      pointPlaceholder: 'Exempel: Produktgrupp',
    };
  }

  if (controlType.category === 'receiving') {
    return {
      mode: 'mixed',
      topbarEyebrow: 'Bygg blandad kontroll',
      previewEyebrow: 'Förhandsvisning',
      previewTitle: 'Så här fyller personalen i varumottagningen',
      previewCount: (activeFields, activeObjects) => `${activeFields} delar · ${activeObjects} punkter`,
      fieldShortcutLabel: 'Lägg till del',
      pointShortcutLabel: 'Lägg till mottagningspunkt',
      emptyTitle: 'Varumottagningen saknar delar',
      emptyDescription: 'Lägg till delar som leverantör, temperatur, korrekt märkning eller följesedel.',
      fieldSummaryTitle: 'Lägg till eller hantera mottagningsdelar',
      fieldSummaryDescription: 'Leverantör, temperatur, märkning, följesedel, foto och andra delar i mottagningsflödet.',
      fieldEyebrow: 'Mottagningsdelar',
      fieldHeading: 'Delar som ska kontrolleras',
      fieldEmptyManage: 'Lägg till minst en del, till exempel Temperatur, Korrekt märkning eller Följesedel.',
      fieldEmptyReadOnly: 'En administratör behöver lägga till mottagningsdelar innan kontrollen kan utföras.',
      fieldFormTitle: 'Lägg till mottagningsdel',
      fieldNameLabel: 'Namn på del',
      pointSummaryTitle: 'Lägg till eller hantera mottagningspunkter',
      pointSummaryDescription: 'Valfritt: används om varumottagningen behöver delas upp per varugrupp, plats eller temperaturgräns.',
      pointEyebrow: 'Mottagningspunkter',
      pointHeading: (controlTypeName) => `Mottagningspunkter för ${controlTypeName}`,
      pointEmptyManage: 'Lägg till mottagningspunkter om personalen ska gå igenom separata varugrupper, till exempel Kylvaror med max 8°C.',
      pointEmptyReadOnly: 'En administratör behöver lägga till mottagningspunkter om kontrollen ska delas upp.',
      pointFormTitle: 'Lägg till mottagningspunkt',
      pointNameLabel: 'Namn på mottagningspunkt',
      pointLocationLabel: 'Plats',
      pointLocationPlaceholder: 'Varugrupp eller plats, frivilligt',
      pointLimitLabel: 'Maxgräns i °C',
      pointInstructionPlaceholder: 'Instruktion för mottagningspunkten, till exempel kontrollera varan direkt vid ankomst',
      pointPlaceholder: 'Exempel: Kylvaror',
    };
  }

  if (controlType.category === 'checklist') {
    return {
      ...pointBasedBuilderCopy,
      previewTitle: 'Så här går personalen igenom checklistans punkter',
      fieldShortcutLabel: 'Hantera OK/Ej OK',
      pointShortcutLabel: 'Lägg till punkt',
      emptyTitle: 'Checklistan saknar OK/Ej OK-status',
      emptyDescription: 'Lägg till den fasta OK/Ej OK-statusen och skapa sedan punkter eller områden som ska kontrolleras.',
      fieldSummaryTitle: 'Fast status: OK / Ej OK',
      fieldSummaryDescription: 'Checklistor bygger på punkter som kontrolleras med OK eller Ej OK.',
      fieldHeading: 'Status som används i checklistan',
      fieldEmptyManage: 'Lägg till OK/Ej OK som status. Områden och saker som ska kontrolleras läggs till som kontrollpunkter.',
      fieldFormTitle: 'Lägg till status',
      pointSummaryDescription: 'Områden, produkter eller saker som ska kontrolleras med OK/Ej OK.',
      pointEyebrow: 'Punkter och områden',
      pointEmptyManage: 'Lägg till områden eller punkter som personalen ska gå igenom, till exempel Kök eller Servering.',
      pointFormTitle: 'Lägg till punkt eller område',
      pointNameLabel: 'Namn på punkt/område',
      pointPlaceholder: 'Exempel: Kök',
    };
  }

  if (controlType.category === 'round') {
    return {
      ...pointBasedBuilderCopy,
      previewTitle: 'Så här går personalen igenom egenkontrollrundan',
      fieldShortcutLabel: 'Hantera OK/Ej OK',
      pointShortcutLabel: 'Lägg till område',
      emptyTitle: 'Rundan saknar OK/Ej OK-status',
      emptyDescription: 'Lägg till den fasta OK/Ej OK-statusen och skapa sedan områden som ska kontrolleras.',
      fieldSummaryTitle: 'Fast status: OK / Ej OK',
      fieldSummaryDescription: 'Rundan bygger på områden som kontrolleras med OK eller Ej OK.',
      fieldHeading: 'Status som används i rundan',
      fieldEmptyManage: 'Lägg till OK/Ej OK som status. Områdena i rundan läggs till som kontrollpunkter.',
      fieldFormTitle: 'Lägg till status',
      pointSummaryDescription: 'Områden som ska ingå i egenkontrollrundan.',
      pointEyebrow: 'Rundans områden',
      pointEmptyManage: 'Lägg till områden som personalen ska gå igenom i rundan.',
      pointFormTitle: 'Lägg till område',
      pointNameLabel: 'Namn på område',
      pointPlaceholder: 'Exempel: Hygien och rengöring',
    };
  }

  return {
    ...pointBasedBuilderCopy,
    topbarEyebrow: 'Bygg kontroll',
    previewTitle: 'Så här fyller personalen i kontrollen',
  };
}

const fieldTypeOptions: Array<{
  fieldType: ControlFieldDefinition['field_type'];
  label: string;
  description: string;
  defaultLabel: string;
}> = [
  { fieldType: 'ok_not_ok', label: 'OK/Ej OK', description: 'För ja/nej-kontroller och avvikelser.', defaultLabel: 'Status' },
  { fieldType: 'textarea', label: 'Kommentar', description: 'Fri text när personalen behöver beskriva något.', defaultLabel: 'Kommentar' },
  { fieldType: 'temperature', label: 'Temperatur', description: 'Temperaturvärde som kan jämföras mot gränsvärden.', defaultLabel: 'Temperatur' },
  { fieldType: 'text', label: 'Text', description: 'Kort text, till exempel batchnummer eller märkning.', defaultLabel: 'Text' },
  { fieldType: 'date', label: 'Datum', description: 'Datumfält, till exempel bäst före.', defaultLabel: 'Datum' },
  { fieldType: 'datetime', label: 'Datum och tid', description: 'Tidpunkt eller tidssteg, till exempel start/slut.', defaultLabel: 'Tidpunkt' },
  { fieldType: 'select', label: 'Val', description: 'Fördefinierat val när alternativen kommer från mall.', defaultLabel: 'Val' },
  { fieldType: 'photo', label: 'Foto', description: 'Bild eller dokumentation från mobilen.', defaultLabel: 'Foto' },
];

const traceabilityFieldTypes = new Set<ControlFieldDefinition['field_type']>(['text', 'date', 'photo', 'select']);
const traceabilityFieldTypeOptions = fieldTypeOptions.filter((option) => traceabilityFieldTypes.has(option.fieldType));
const receivingFieldTypes = new Set<ControlFieldDefinition['field_type']>(['text', 'temperature', 'ok_not_ok', 'date', 'photo', 'select']);
const receivingFieldTypeOptions = fieldTypeOptions.filter((option) => receivingFieldTypes.has(option.fieldType));

type FieldPreset = {
  fieldType: ControlFieldDefinition['field_type'];
  label: string;
  description: string;
  required: boolean;
};

const traceabilityFieldPresets: FieldPreset[] = [
  {
    fieldType: 'text',
    label: 'Produkt',
    description: 'Vad varan eller råvaran heter.',
    required: true,
  },
  {
    fieldType: 'text',
    label: 'Batchnummer',
    description: 'Batch, lot eller annan spårbar kod.',
    required: true,
  },
  {
    fieldType: 'date',
    label: 'Bäst före',
    description: 'Produktens bäst före-datum.',
    required: false,
  },
  {
    fieldType: 'text',
    label: 'Leverantör',
    description: 'Vem produkten kommer från.',
    required: true,
  },
  {
    fieldType: 'photo',
    label: 'Foto / etikett',
    description: 'Bild på etikett, följesedel eller produkt.',
    required: false,
  },
];

const receivingFieldPresets: FieldPreset[] = [
  {
    fieldType: 'text',
    label: 'Leverantör',
    description: 'Vem leveransen kommer från.',
    required: true,
  },
  {
    fieldType: 'temperature',
    label: 'Temperatur',
    description: 'Temperatur vid mottagning. Använd mottagningspunkt för maxgräns i °C.',
    required: true,
  },
  {
    fieldType: 'ok_not_ok',
    label: 'Korrekt märkning',
    description: 'OK / Ej OK för märkning, etikett eller förpackning.',
    required: true,
  },
  {
    fieldType: 'photo',
    label: 'Följesedel / foto',
    description: 'Bild på följesedel, etikett eller leverans.',
    required: false,
  },
];

function getFieldTypeOptionsForCategory(category: ControlCategory) {
  if (category === 'traceability') return traceabilityFieldTypeOptions;
  if (category === 'receiving') return receivingFieldTypeOptions;
  return fieldTypeOptions;
}

function getEffectiveFieldType(category: ControlCategory, fieldType: ControlFieldDefinition['field_type']) {
  const availableOptions = getFieldTypeOptionsForCategory(category);
  return availableOptions.some((option) => option.fieldType === fieldType)
    ? fieldType
    : availableOptions[0]?.fieldType ?? fieldType;
}

function formatTemperaturePointMeta(controlObject: ControlObject): string {
  const location = controlObject.location?.trim();
  const unit = controlObject.unit ?? '°C';
  const limitText = controlObject.limit_max !== null && controlObject.limit_max !== undefined
    ? `Max ${controlObject.limit_max}${unit}`
    : 'Maxgräns saknas';

  return location ? `${location} · ${limitText}` : limitText;
}

function formatControlPointMeta(controlObject: ControlObject, category: ControlCategory): string {
  if (category === 'temperature') {
    return formatTemperaturePointMeta(controlObject);
  }

  if (category === 'checklist' || category === 'round') {
    return controlObject.location?.trim() || 'OK / Ej OK';
  }

  if (category === 'receiving') {
    const location = controlObject.location?.trim() || 'Mottagningspunkt';
    const unit = controlObject.unit ?? '°C';
    return controlObject.limit_max !== null && controlObject.limit_max !== undefined
      ? `${location} · Max ${controlObject.limit_max}${unit}`
      : location;
  }

  return `${controlObject.location ?? 'Ingen plats'} · ${controlObject.limit_max ?? 'Ingen gräns'} ${controlObject.unit ?? ''}`;
}

export function ControlTypeDetailView({
  organizationId,
  controlType,
  canManage,
  onBack,
  onChanged,
}: ControlTypeDetailViewProps) {
  const [objects, setObjects] = useState<ControlObject[]>([]);
  const [fields, setFields] = useState<ControlFieldDefinition[]>([]);
  const [objectName, setObjectName] = useState('');
  const [objectLocation, setObjectLocation] = useState('');
  const [objectInstructions, setObjectInstructions] = useState('');
  const [limitMax, setLimitMax] = useState('');
  const [fieldLabel, setFieldLabel] = useState('Status');
  const [fieldType, setFieldType] = useState<ControlFieldDefinition['field_type']>('ok_not_ok');
  const [fieldRequired, setFieldRequired] = useState(true);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldLabel, setEditFieldLabel] = useState('');
  const [editFieldRequired, setEditFieldRequired] = useState(false);
  const [editFieldActive, setEditFieldActive] = useState(true);
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);
  const [editObjectName, setEditObjectName] = useState('');
  const [editObjectLocation, setEditObjectLocation] = useState('');
  const [editObjectInstructions, setEditObjectInstructions] = useState('');
  const [editObjectLimitMax, setEditObjectLimitMax] = useState('');
  const [editObjectActive, setEditObjectActive] = useState(true);
  const [typeName, setTypeName] = useState(controlType.name);
  const [typeCategory, setTypeCategory] = useState<ControlCategory>(controlType.category);
  const [typeFrequency, setTypeFrequency] = useState<ControlFrequency>(controlType.frequency);
  const [typeWeekday, setTypeWeekday] = useState<IsoWeekday>(() => readWeeklyWeekday(controlType.frequency_config));
  const [typeInstructions, setTypeInstructions] = useState(controlType.instructions ?? '');
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState(false);
  const [message, setMessage] = useState('');
  const [fieldToolsOpen, setFieldToolsOpen] = useState(false);
  const [pointToolsOpen, setPointToolsOpen] = useState(false);
  const [pendingToolFocus, setPendingToolFocus] = useState<'field' | 'point' | null>(null);
  const fieldToolsRef = useRef<HTMLDetailsElement | null>(null);
  const pointToolsRef = useRef<HTMLDetailsElement | null>(null);

  async function refreshObjects() {
    const nextObjects = await listControlObjects(organizationId, controlType.id);
    setObjects(nextObjects);
  }

  async function refreshFields() {
    const nextFields = await listControlFields(organizationId, controlType.id);
    setFields(nextFields);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setMessage('');
        const [nextObjects, nextFields] = await Promise.all([
          listControlObjects(organizationId, controlType.id),
          listControlFields(organizationId, controlType.id),
        ]);
        if (active) {
          setObjects(nextObjects);
          setFields(nextFields);
        }
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Kunde inte läsa kontrolltypen.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [organizationId, controlType.id]);

  useEffect(() => {
    setTypeName(controlType.name);
    setTypeCategory(controlType.category);
    setTypeFrequency(controlType.frequency);
    setTypeWeekday(readWeeklyWeekday(controlType.frequency_config));
    setTypeInstructions(controlType.instructions ?? '');
  }, [
    controlType.category,
    controlType.frequency,
    controlType.frequency_config,
    controlType.id,
    controlType.instructions,
    controlType.name,
  ]);

  async function handleSaveControlType(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!typeName.trim()) return;

    try {
      setSavingType(true);
      setMessage('');
      await updateControlType(controlType.id, organizationId, {
        name: typeName,
        active: controlType.active,
        category: typeCategory,
        frequency: typeFrequency,
        frequencyConfig: typeFrequency === 'weekly'
          ? getFrequencyConfigWithWeekday(controlType.frequency_config, typeWeekday)
          : controlType.frequency_config,
        instructions: typeInstructions,
      });
      await onChanged();
      setMessage('Kontrolltypen sparades.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte spara kontrolltypen.');
    } finally {
      setSavingType(false);
    }
  }

  async function handleCreateObject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      await createControlObject({
        organizationId,
        controlTypeId: controlType.id,
        name: objectName.trim(),
        location: objectLocation.trim() || undefined,
        instructions: objectInstructions,
        limitMax: limitMax ? Number(limitMax) : null,
        unit: controlType.category === 'temperature' || controlType.category === 'receiving' ? '°C' : undefined,
      });
      setObjectName('');
      setObjectLocation('');
      setObjectInstructions('');
      setLimitMax('');
      await refreshObjects();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa kontrollpunkt.');
    }
  }

  async function handleCreateField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    try {
      const safeFieldType = getEffectiveFieldType(controlType.category, fieldType);
      const selectedOption = getFieldTypeOptionsForCategory(controlType.category)
        .find((option) => option.fieldType === safeFieldType);
      const label = fieldType === safeFieldType ? fieldLabel : selectedOption?.defaultLabel ?? fieldLabel;
      await createControlField({
        organizationId,
        controlTypeId: controlType.id,
        label: label.trim(),
        fieldType: safeFieldType,
        required: fieldRequired,
      });
      setFieldLabel(selectedOption?.defaultLabel ?? '');
      setFieldRequired(safeFieldType === 'ok_not_ok' || safeFieldType === 'temperature');
      await refreshFields();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa formulärfält.');
    }
  }

  async function handleCreateFieldPreset(preset: FieldPreset) {
    setMessage('');

    try {
      await createControlField({
        organizationId,
        controlTypeId: controlType.id,
        label: preset.label,
        fieldType: preset.fieldType,
        required: preset.required,
      });
      setFieldType(preset.fieldType);
      setFieldLabel(preset.label);
      setFieldRequired(preset.required);
      await refreshFields();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa informationsfält.');
    }
  }

  async function handleCreateTemperatureMeasurement() {
    setMessage('');

    try {
      await createControlField({
        organizationId,
        controlTypeId: controlType.id,
        label: 'Temperatur',
        fieldType: 'temperature',
        required: true,
      });
      await refreshFields();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa temperaturmätning.');
    }
  }

  async function handleCreateChecklistStatus() {
    setMessage('');

    try {
      await createControlField({
        organizationId,
        controlTypeId: controlType.id,
        label: 'Status',
        fieldType: 'ok_not_ok',
        required: true,
      });
      await refreshFields();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte skapa OK/Ej OK-status.');
    }
  }

  async function handleToggleType() {
    setMessage('');
    try {
      await setControlTypeActive(controlType.id, organizationId, !controlType.active);
      await onChanged();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte ändra kontrolltypen.');
    }
  }

  async function handleToggleObject(controlObject: ControlObject) {
    setMessage('');
    try {
      await setControlObjectActive(controlObject.id, organizationId, !controlObject.active);
      await refreshObjects();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte ändra kontrollpunkten.');
    }
  }

  function handleStartEditObject(controlObject: ControlObject) {
    setEditingFieldId(null);
    setEditingObjectId(controlObject.id);
    setEditObjectName(controlObject.name);
    setEditObjectLocation(controlObject.location ?? '');
    setEditObjectInstructions(controlObject.instructions ?? '');
    setEditObjectLimitMax(controlObject.limit_max === null ? '' : String(controlObject.limit_max));
    setEditObjectActive(controlObject.active);
  }

  async function handleSaveObject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingObjectId) return;
    setMessage('');

    try {
      await updateControlObject({
        controlObjectId: editingObjectId,
        organizationId,
        name: editObjectName,
        location: editObjectLocation,
        instructions: editObjectInstructions,
        limitMax:
          (controlType.category === 'temperature' || controlType.category === 'receiving') && editObjectLimitMax
            ? Number(editObjectLimitMax)
            : null,
        active: editObjectActive,
      });
      setEditingObjectId(null);
      await refreshObjects();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte uppdatera kontrollpunkten.');
    }
  }

  function handleSelectFieldType(nextFieldType: ControlFieldDefinition['field_type']) {
    const safeFieldType = getEffectiveFieldType(controlType.category, nextFieldType);
    const selectedOption = getFieldTypeOptionsForCategory(controlType.category)
      .find((option) => option.fieldType === safeFieldType);
    setFieldType(safeFieldType);
    setFieldLabel(selectedOption?.defaultLabel ?? '');
    setFieldRequired(safeFieldType === 'ok_not_ok' || safeFieldType === 'temperature');
  }

  function handleStartEditField(field: ControlFieldDefinition) {
    setEditingObjectId(null);
    setEditingFieldId(field.id);
    setEditFieldLabel(field.label);
    setEditFieldRequired(field.required);
    setEditFieldActive(field.active);
  }

  async function handleSaveField(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingFieldId) return;
    setMessage('');

    try {
      await updateControlField({
        fieldDefinitionId: editingFieldId,
        organizationId,
        label: editFieldLabel.trim(),
        required: editFieldRequired,
        active: editFieldActive,
      });
      setEditingFieldId(null);
      await refreshFields();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Kunde inte uppdatera formulärfältet.');
    }
  }

  function renderInlineFieldEditor(field: ControlFieldDefinition) {
    if (editingFieldId !== field.id) return null;

    return (
      <form className="control-field-edit-form canvas-inline-edit-form" onSubmit={handleSaveField}>
        <label>
          <span>{builderCopy.fieldNameLabel}</span>
          <input
            className="text-input"
            value={editFieldLabel}
            onChange={(event) => setEditFieldLabel(event.target.value)}
            required
          />
        </label>
        <label className="control-field-checkbox">
          <input
            checked={editFieldRequired}
            onChange={(event) => setEditFieldRequired(event.target.checked)}
            type="checkbox"
          />
          Obligatoriskt
        </label>
        <label className="control-field-checkbox">
          <input
            checked={editFieldActive}
            onChange={(event) => setEditFieldActive(event.target.checked)}
            type="checkbox"
          />
          Aktivt
        </label>
        <div className="control-field-actions">
          <button className="control-point-action" type="submit">Spara</button>
          <button className="control-point-action" type="button" onClick={() => setEditingFieldId(null)}>
            Avbryt
          </button>
        </div>
      </form>
    );
  }

  function renderInlineObjectEditor(controlObject: ControlObject) {
    if (editingObjectId !== controlObject.id) return null;

    return (
      <form className="control-point-edit-form canvas-inline-edit-form" onSubmit={handleSaveObject}>
        <label>
          <span>{builderCopy.pointNameLabel}</span>
          <input
            className="text-input"
            value={editObjectName}
            onChange={(event) => setEditObjectName(event.target.value)}
            required
          />
        </label>
        <label>
          <span>{builderCopy.pointLocationLabel}</span>
          <input
            className="text-input"
            value={editObjectLocation}
            onChange={(event) => setEditObjectLocation(event.target.value)}
          />
        </label>
        {controlType.category === 'temperature' ? (
          <label>
            <span>{builderCopy.pointLimitLabel}</span>
            <input
              className="text-input"
              value={editObjectLimitMax}
              onChange={(event) => setEditObjectLimitMax(event.target.value)}
              required={isTemperatureControl}
              type="number"
            />
          </label>
        ) : null}
        <label>
          <span>Instruktion</span>
          <textarea
            className="text-input control-type-instructions-input"
            value={editObjectInstructions}
            onChange={(event) => setEditObjectInstructions(event.target.value)}
            rows={4}
          />
        </label>
        <label className="control-field-checkbox">
          <input
            checked={editObjectActive}
            onChange={(event) => setEditObjectActive(event.target.checked)}
            type="checkbox"
          />
          Aktiv
        </label>
        <div className="control-field-actions">
          <button className="control-point-action" type="submit">Spara</button>
          <button className="control-point-action" type="button" onClick={() => setEditingObjectId(null)}>
            Avbryt
          </button>
        </div>
      </form>
    );
  }

  const activeFields = fields.filter((field) => field.active);
  const activeObjects = objects.filter((item) => item.active);
  const inactiveFields = fields.filter((field) => !field.active);
  const inactiveObjects = objects.filter((item) => !item.active);
  const activeFieldCount = activeFields.length;
  const builderCopy = getBuilderCopy(controlType);
  const isTemperatureControl = controlType.category === 'temperature';
  const isTraceabilityControl = controlType.category === 'traceability';
  const isReceivingControl = controlType.category === 'receiving';
  const isPointChecklistControl = controlType.category === 'checklist' || controlType.category === 'round';
  const isFixedPointControl = isTemperatureControl || isPointChecklistControl;
  const availableFieldTypeOptions = getFieldTypeOptionsForCategory(controlType.category);
  const effectiveFieldType = getEffectiveFieldType(controlType.category, fieldType);
  const fieldPresets = isTraceabilityControl
    ? traceabilityFieldPresets
    : isReceivingControl
      ? receivingFieldPresets
      : [];
  const activeTemperatureFields = activeFields.filter((field) => field.field_type === 'temperature');
  const activeStatusFields = activeFields.filter((field) => field.field_type === 'ok_not_ok');
  const previewFields = isTemperatureControl
    ? activeTemperatureFields
    : isPointChecklistControl
      ? activeStatusFields
      : activeFields;
  const hasTemperatureMeasurement = activeTemperatureFields.length > 0;
  const hasChecklistStatus = activeStatusFields.length > 0;
  const visibleFieldCount = isTemperatureControl
    ? activeTemperatureFields.length
    : isPointChecklistControl
      ? activeStatusFields.length
      : activeFieldCount;
  const canRenderPreviewCanvas = previewFields.length > 0 && (!isFixedPointControl || activeObjects.length > 0);
  const fixedPointMissingObjects = isFixedPointControl && previewFields.length > 0 && activeObjects.length === 0;
  const previewEmptyTitle = fixedPointMissingObjects
    ? isTemperatureControl
      ? 'Lägg till kylar eller frysar'
      : 'Lägg till punkter eller områden'
    : builderCopy.emptyTitle;
  const previewEmptyDescription = fixedPointMissingObjects
    ? isTemperatureControl
      ? 'Temperaturmätningen finns. Lägg till minst en kyl eller frys som kontrollpunkt för att se previewn.'
      : 'OK/Ej OK-status finns. Lägg till minst en punkt eller ett område för att se checklistans preview.'
    : builderCopy.emptyDescription;
  const selectedFieldTypeOption = availableFieldTypeOptions.find((option) => option.fieldType === effectiveFieldType);
  const showPointShortcut = !isTraceabilityControl || activeObjects.length > 0;

  useEffect(() => {
    if (!loading && canManage && isFixedPointControl && objects.length === 0) {
      setPointToolsOpen(true);
      return;
    }

    if (!loading && canManage && fields.length === 0) {
      setFieldToolsOpen(true);
    }
  }, [canManage, fields.length, isFixedPointControl, loading, objects.length]);

  useEffect(() => {
    if (!pendingToolFocus) return undefined;
    if (pendingToolFocus === 'field' && !fieldToolsOpen) return undefined;
    if (pendingToolFocus === 'point' && !pointToolsOpen) return undefined;

    const timeoutId = window.setTimeout(() => {
      const target = pendingToolFocus === 'field' ? fieldToolsRef.current : pointToolsRef.current;
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target
        ?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input.text-input, textarea.text-input, select.text-input')
        ?.focus({ preventScroll: true });
      setPendingToolFocus(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fieldToolsOpen, pendingToolFocus, pointToolsOpen]);

  function openFieldTools() {
    setFieldToolsOpen(true);
    setPendingToolFocus('field');
  }

  function openPointTools() {
    setPointToolsOpen(true);
    setPendingToolFocus('point');
  }

  return (
    <section className="control-type-detail" aria-labelledby="control-type-detail-title">
      <div className="control-type-detail-topbar">
        <ActionButton className="nav-back-button" variant="secondary" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span>
          Tillbaka
        </ActionButton>
        <div>
          <p className="eyebrow">{builderCopy.topbarEyebrow}</p>
          <h3 id="control-type-detail-title">{controlType.name}</h3>
        </div>
      </div>

      {message ? <p className="form-message error-message">{message}</p> : null}

      <div className="control-type-detail-card control-type-context-card">
        <div>
          <span>Kategori</span>
          <strong>{categoryLabels[controlType.category]}</strong>
        </div>
        <div>
          <span>Frekvens</span>
          <strong>{formatFrequencyLabel(controlType)}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{controlType.active ? 'Aktiv' : 'Inaktiv'}</strong>
        </div>
      </div>

      <section className="control-type-preview-section" aria-labelledby="control-type-preview-title">
        <div className="control-point-heading">
          <div>
            <p className="eyebrow">{builderCopy.previewEyebrow}</p>
            <h4 id="control-type-preview-title">{builderCopy.previewTitle}</h4>
          </div>
          <div className="control-canvas-heading-actions">
            <span className="control-point-count">{builderCopy.previewCount(activeFieldCount, activeObjects.length)}</span>
            {canManage ? (
              <div className="control-canvas-shortcuts" aria-label="Snabbval för kontrollen">
                <button type="button" className="control-point-action" onClick={openFieldTools}>
                  {builderCopy.fieldShortcutLabel}
                </button>
                {showPointShortcut ? (
                  <button type="button" className="control-point-action" onClick={openPointTools}>
                    {builderCopy.pointShortcutLabel}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {loading ? <p className="muted-copy">Laddar kontrollen...</p> : null}
        {!loading && !canRenderPreviewCanvas ? (
          <div className="control-detail-empty">
            <strong>{previewEmptyTitle}</strong>
            <p className="muted-copy">{previewEmptyDescription}</p>
          </div>
        ) : null}
        {!loading && canRenderPreviewCanvas ? (
          <ControlDefinitionCanvas
            controlType={controlType}
            objects={activeObjects}
            fields={previewFields}
            mode={canManage ? 'edit' : 'preview'}
            selectedFieldId={editingFieldId}
            selectedObjectId={editingObjectId}
            onEditField={handleStartEditField}
            onEditObject={handleStartEditObject}
            hideFieldEditControls={isFixedPointControl}
            renderFieldEditor={renderInlineFieldEditor}
            renderObjectEditor={renderInlineObjectEditor}
          />
        ) : null}
      </section>

      {canManage ? (
        <details className="control-admin-panel">
          <summary>
            <span>
              <strong>Namn, rutin och schema</strong>
              <small>Inställningar som styr när kontrollen visas.</small>
            </span>
          </summary>
          <form className="control-type-settings-form" onSubmit={handleSaveControlType}>
          <div className="control-point-heading">
            <div>
              <p className="eyebrow">Grunduppgifter</p>
              <h4>Namn och rutin</h4>
            </div>
          </div>
          <label>
            <span>Namn</span>
            <input
              className="text-input"
              value={typeName}
              onChange={(event) => setTypeName(event.target.value)}
              required
            />
          </label>
          <label>
            <span>Kategori</span>
            <select
              className="text-input"
              value={typeCategory}
              onChange={(event) => setTypeCategory(event.target.value as ControlCategory)}
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Frekvens</span>
            <select
              className="text-input"
              value={typeFrequency}
              onChange={(event) => setTypeFrequency(event.target.value as ControlFrequency)}
            >
              {Object.entries(frequencyLabels).map(([value, label]) => (
                <option value={value} key={value}>{label}</option>
              ))}
            </select>
          </label>
          {typeFrequency === 'weekly' ? (
            <label>
              <span>Veckodag</span>
              <select
                className="text-input"
                value={typeWeekday}
                onChange={(event) => setTypeWeekday(Number(event.target.value) as IsoWeekday)}
              >
                {weekdayOptions.map((option) => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            <span>Rutin eller instruktion</span>
            <textarea
              className="text-input control-type-instructions-input"
              value={typeInstructions}
              onChange={(event) => setTypeInstructions(event.target.value)}
              placeholder="Beskriv hur kontrollen ska göras, när den ska göras och vad personalen ska göra vid avvikelse."
              rows={5}
            />
          </label>
          <ActionButton type="submit" disabled={savingType || !typeName.trim()}>
            {savingType ? 'Sparar...' : 'Spara kontrolltyp'}
          </ActionButton>
          </form>
        </details>
      ) : controlType.instructions ? (
        <div className="control-type-settings-form">
          <div>
            <p className="eyebrow">Rutin eller instruktion</p>
            <p className="control-type-instructions-copy">{controlType.instructions}</p>
          </div>
        </div>
      ) : null}

      {canManage ? (
        <ActionButton variant="secondary" type="button" onClick={handleToggleType}>
          {controlType.active ? 'Arkivera kontrolltyp' : 'Återaktivera kontrolltyp'}
        </ActionButton>
      ) : null}

      <details
        className="control-field-section control-admin-panel"
        open={fieldToolsOpen}
        ref={fieldToolsRef}
        onToggle={(event) => setFieldToolsOpen(event.currentTarget.open)}
      >
        <summary>
          <span>
            <strong>{builderCopy.fieldSummaryTitle}</strong>
            <small>{builderCopy.fieldSummaryDescription}</small>
          </span>
        </summary>
        <div className="control-point-heading">
          <div>
            <p className="eyebrow">{builderCopy.fieldEyebrow}</p>
            <h4>{builderCopy.fieldHeading}</h4>
          </div>
          <span className="control-point-count">{visibleFieldCount} aktiva</span>
        </div>

        {loading ? <p className="muted-copy">Laddar uppgifter...</p> : null}
        {!loading && !isFixedPointControl && fields.length === 0 ? (
          <div className="control-detail-empty">
            <strong>Inga uppgifter finns ännu</strong>
            <p className="muted-copy">
              {canManage
                ? builderCopy.fieldEmptyManage
                : builderCopy.fieldEmptyReadOnly}
            </p>
          </div>
        ) : null}

        {isFixedPointControl ? (
          <div className="field-create-panel">
            <div className="field-create-summary">
              <div className="control-field-icon" aria-hidden="true">
                <img src={isTemperatureControl ? fieldTypeIconPaths.temperature : fieldTypeIconPaths.ok_not_ok} alt="" />
              </div>
              <div>
                <h5>
                  {isTemperatureControl
                    ? hasTemperatureMeasurement ? 'Temperaturmätning finns' : 'Temperaturmätning saknas'
                    : hasChecklistStatus ? 'OK/Ej OK-status finns' : 'OK/Ej OK-status saknas'}
                </h5>
                {isTemperatureControl ? (
                  <p>
                    Temperatur är den fasta mätningen för den här kontrolltypen. Lägg till kylar och frysar som
                    kontrollpunkter med maxgräns i °C. Datum, tid och användare sparas automatiskt.
                  </p>
                ) : (
                  <p>
                    OK/Ej OK är den fasta svarstypen för den här kontrolltypen. Lägg till områden, produkter eller
                    ronderingspunkter som kontrollpunkter. Kommentar och åtgärd visas först vid Ej OK.
                  </p>
                )}
              </div>
            </div>
            {isTemperatureControl && !hasTemperatureMeasurement && canManage ? (
              <ActionButton type="button" onClick={handleCreateTemperatureMeasurement}>
                Skapa temperaturmätning
              </ActionButton>
            ) : null}
            {isPointChecklistControl && !hasChecklistStatus && canManage ? (
              <ActionButton type="button" onClick={handleCreateChecklistStatus}>
                Skapa OK/Ej OK-status
              </ActionButton>
            ) : null}
          </div>
        ) : null}

        {!isFixedPointControl && inactiveFields.length > 0 ? (
        <div className="control-field-list">
          {inactiveFields.map((field) => (
            <article className="control-field-card inactive" key={field.id}>
              <div className="control-field-icon" aria-hidden="true">
                <img src={fieldTypeIconPaths[field.field_type]} alt="" />
              </div>

              {editingFieldId === field.id ? (
                <form className="control-field-edit-form" onSubmit={handleSaveField}>
                  <label>
                    <span>{builderCopy.fieldNameLabel}</span>
                    <input
                      className="text-input"
                      value={editFieldLabel}
                      onChange={(event) => setEditFieldLabel(event.target.value)}
                      required
                    />
                  </label>
                  <label className="control-field-checkbox">
                    <input
                      checked={editFieldRequired}
                      onChange={(event) => setEditFieldRequired(event.target.checked)}
                      type="checkbox"
                    />
                    Obligatoriskt
                  </label>
                  <label className="control-field-checkbox">
                    <input
                      checked={editFieldActive}
                      onChange={(event) => setEditFieldActive(event.target.checked)}
                      type="checkbox"
                    />
                    Aktivt
                  </label>
                  <div className="control-field-actions">
                    <button className="control-point-action" type="submit">Spara</button>
                    <button className="control-point-action" type="button" onClick={() => setEditingFieldId(null)}>
                      Avbryt
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h4>{field.label}</h4>
                    <p>
                      {fieldTypeLabels[field.field_type]} · {field.required ? 'Obligatoriskt' : 'Frivilligt'} ·{' '}
                      {field.active ? 'Aktivt' : 'Inaktivt'}
                    </p>
                  </div>
                  {canManage ? (
                    <button className="control-point-action" type="button" onClick={() => handleStartEditField(field)}>
                      Redigera
                    </button>
                  ) : null}
                </>
              )}
            </article>
          ))}
        </div>
        ) : null}

        {canManage && !isFixedPointControl ? (
          <form className="control-field-form" onSubmit={handleCreateField}>
            {fieldPresets.length > 0 ? (
              <div className="field-create-panel">
                <div className="field-create-summary">
                  <div className="control-field-icon" aria-hidden="true">
                    <img src={categoryIconPaths[controlType.category]} alt="" />
                  </div>
                  <div>
                    <h5>{isTraceabilityControl ? 'Vanliga spårbarhetsfält' : 'Vanliga mottagningsdelar'}</h5>
                    {isTraceabilityControl ? (
                      <p>
                        Lägg till informationsfält som personalen fyller i. Datum, tid och användare sparas automatiskt
                        när dokumentationen görs.
                      </p>
                    ) : (
                      <p>
                        Lägg till delarna som personalen kontrollerar vid mottagning. Åtgärd och kommentar visas först
                        vid avvikelse eller Ej OK.
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className="field-type-grid"
                  role="group"
                  aria-label={isTraceabilityControl ? 'Vanliga spårbarhetsfält' : 'Vanliga mottagningsdelar'}
                >
                  {fieldPresets.map((preset) => (
                    <button
                      className="field-type-option"
                      key={`${preset.fieldType}-${preset.label}`}
                      onClick={() => void handleCreateFieldPreset(preset)}
                      type="button"
                    >
                      <strong>{preset.label}</strong>
                      <span>{preset.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <h4>
              {isTraceabilityControl
                ? 'Lägg till anpassat informationsfält'
                : isReceivingControl
                  ? 'Lägg till anpassad mottagningsdel'
                  : builderCopy.fieldFormTitle}
            </h4>
            <div className="field-type-grid" role="group" aria-label="Fälttyp">
              {availableFieldTypeOptions.map((option) => (
                <button
                  className={effectiveFieldType === option.fieldType ? 'field-type-option selected' : 'field-type-option'}
                  key={option.fieldType}
                  onClick={() => handleSelectFieldType(option.fieldType)}
                  type="button"
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
            {selectedFieldTypeOption ? (
              <div className="field-create-panel">
                <div className="field-create-summary">
                  <div className="control-field-icon" aria-hidden="true">
                    <img src={fieldTypeIconPaths[selectedFieldTypeOption.fieldType]} alt="" />
                  </div>
                  <div>
                    <h5>Skapa {selectedFieldTypeOption.label}</h5>
                    <p>{selectedFieldTypeOption.description}</p>
                  </div>
                </div>
                <label>
                  <span>{builderCopy.fieldNameLabel}</span>
                  <input
                    className="text-input"
                    value={fieldType === effectiveFieldType ? fieldLabel : selectedFieldTypeOption.defaultLabel}
                    onChange={(event) => {
                      if (fieldType !== effectiveFieldType) {
                        setFieldType(effectiveFieldType);
                      }
                      setFieldLabel(event.target.value);
                    }}
                    required
                  />
                </label>
                <label className="control-field-checkbox">
                  <input
                    checked={fieldRequired}
                    onChange={(event) => setFieldRequired(event.target.checked)}
                    type="checkbox"
                  />
                  Obligatoriskt
                </label>
                <ActionButton type="submit">{builderCopy.fieldFormTitle}</ActionButton>
              </div>
            ) : null}
          </form>
        ) : null}
      </details>

      <details
        className="control-point-section control-admin-panel"
        open={pointToolsOpen}
        ref={pointToolsRef}
        onToggle={(event) => setPointToolsOpen(event.currentTarget.open)}
      >
        <summary>
          <span>
            <strong>{builderCopy.pointSummaryTitle}</strong>
            <small>{builderCopy.pointSummaryDescription}</small>
          </span>
        </summary>
        <div className="control-point-heading">
          <div>
            <p className="eyebrow">{builderCopy.pointEyebrow}</p>
            <h4>{builderCopy.pointHeading(controlType.name)}</h4>
          </div>
          <span className="control-point-count">{activeObjects.length} aktiva</span>
        </div>

        {loading ? <p className="muted-copy">Laddar kontrollpunkter...</p> : null}
        {!loading && objects.length === 0 ? (
          <div className="control-detail-empty">
            <strong>Inga kontrollpunkter finns ännu</strong>
            <p className="muted-copy">
              {canManage
                ? builderCopy.pointEmptyManage
                : builderCopy.pointEmptyReadOnly}
            </p>
          </div>
        ) : null}

        {inactiveObjects.length > 0 ? (
        <div className="control-point-list">
          {inactiveObjects.map((controlObject) => (
            <article className="control-point-card inactive" key={controlObject.id}>
              <div className="control-point-icon" aria-hidden="true">
                <img src={categoryIconPaths[controlType.category]} alt="" />
              </div>
              {editingObjectId === controlObject.id ? (
                <form className="control-point-edit-form" onSubmit={handleSaveObject}>
                  <label>
                    <span>{builderCopy.pointNameLabel}</span>
                    <input
                      className="text-input"
                      value={editObjectName}
                      onChange={(event) => setEditObjectName(event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>{builderCopy.pointLocationLabel}</span>
                    <input
                      className="text-input"
                      value={editObjectLocation}
                      onChange={(event) => setEditObjectLocation(event.target.value)}
                    />
                  </label>
                  {isTemperatureControl || isReceivingControl ? (
                    <label>
                      <span>{builderCopy.pointLimitLabel}</span>
                      <input
                        className="text-input"
                        value={editObjectLimitMax}
                        onChange={(event) => setEditObjectLimitMax(event.target.value)}
                        required={isTemperatureControl}
                        type="number"
                      />
                    </label>
                  ) : null}
                  <label>
                    <span>Instruktion</span>
                    <textarea
                      className="text-input control-type-instructions-input"
                      value={editObjectInstructions}
                      onChange={(event) => setEditObjectInstructions(event.target.value)}
                      rows={4}
                    />
                  </label>
                  <label className="control-field-checkbox">
                    <input
                      checked={editObjectActive}
                      onChange={(event) => setEditObjectActive(event.target.checked)}
                      type="checkbox"
                    />
                    Aktiv
                  </label>
                  <div className="control-field-actions">
                    <button className="control-point-action" type="submit">Spara</button>
                    <button className="control-point-action" type="button" onClick={() => setEditingObjectId(null)}>
                      Avbryt
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h4>{controlObject.name}</h4>
                    <p>
                      {formatControlPointMeta(controlObject, controlType.category)}
                    </p>
                    {controlObject.instructions ? (
                      <p className="control-point-instructions">{controlObject.instructions}</p>
                    ) : null}
                  </div>
                  {canManage ? (
                    <div className="control-field-actions">
                      <button className="control-point-action" type="button" onClick={() => handleStartEditObject(controlObject)}>
                        Redigera
                      </button>
                      <button className="control-point-action" type="button" onClick={() => handleToggleObject(controlObject)}>
                        {controlObject.active ? 'Arkivera' : 'Återaktivera'}
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </article>
          ))}
        </div>
        ) : null}

        {canManage ? (
          <form className="control-point-form" onSubmit={handleCreateObject}>
            <h4>{builderCopy.pointFormTitle}</h4>
            <label>
              <span>{builderCopy.pointNameLabel}</span>
              <input
                className="text-input"
                value={objectName}
                onChange={(event) => setObjectName(event.target.value)}
                placeholder={builderCopy.pointPlaceholder}
                required
              />
            </label>
            <label>
              <span>{builderCopy.pointLocationLabel}</span>
              <input
                className="text-input"
                value={objectLocation}
                onChange={(event) => setObjectLocation(event.target.value)}
                placeholder={builderCopy.pointLocationPlaceholder}
              />
            </label>
            {isTemperatureControl || isReceivingControl ? (
              <label>
                <span>{builderCopy.pointLimitLabel}</span>
                <input
                  className="text-input"
                  value={limitMax}
                  onChange={(event) => setLimitMax(event.target.value)}
                  placeholder="Exempel: 8"
                  required={isTemperatureControl}
                  type="number"
                />
              </label>
            ) : null}
            <label>
              <span>Instruktion</span>
              <textarea
                className="text-input control-type-instructions-input"
                value={objectInstructions}
                onChange={(event) => setObjectInstructions(event.target.value)}
                placeholder={builderCopy.pointInstructionPlaceholder}
                rows={4}
              />
            </label>
            <ActionButton type="submit">{builderCopy.pointFormTitle}</ActionButton>
          </form>
        ) : null}
      </details>
    </section>
  );
}
