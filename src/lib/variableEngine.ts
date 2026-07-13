export interface DetectedVariable {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'number';
  options?: string[];
  defaultValue?: string;
  placeholder?: string;
  required: boolean;
}

const variablePattern = /\{\{(\w+)\}\}/g;

const labelOverrides: Record<string, string> = {
  BusinessName: 'Business Name',
  TargetAudience: 'Target Audience',
  Goal: 'Goal',
  Offer: 'Offer',
  City: 'City',
  Country: 'Country',
  Language: 'Language',
  Tone: 'Tone',
  Industry: 'Industry',
};

export function extractVariables(template: string): DetectedVariable[] {
  const names = new Set<string>();
  let match;
  while ((match = variablePattern.exec(template)) !== null) {
    names.add(match[1]);
  }
  return Array.from(names).map((name) => ({
    name,
    label: labelOverrides[name] || name.replace(/([A-Z])/g, ' $1').trim(),
    type: inferType(name),
    defaultValue: '',
    placeholder: `Enter ${(labelOverrides[name] || name).toLowerCase()}...`,
    required: true,
  }));
}

function inferType(name: string): DetectedVariable['type'] {
  const selectFields = ['Tone', 'Language', 'Industry', 'Country', 'Difficulty'];
  if (selectFields.includes(name)) return 'select';
  if (name.toLowerCase().includes('date') || name === 'Date') return 'date';
  if (name.toLowerCase().includes('number') || name === 'Number' || name === 'Count') return 'number';
  if (name.toLowerCase().includes('description') || name.toLowerCase().includes('content')) return 'textarea';
  return 'text';
}

export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(variablePattern, (_, name) => values[name]?.trim() || `{{${name}}}`);
}

export function hasVariables(template: string): boolean {
  return variablePattern.test(template);
}

export function getVariableNames(template: string): string[] {
  const names: string[] = [];
  let match;
  while ((match = variablePattern.exec(template)) !== null) {
    names.push(match[1]);
  }
  return names;
}
