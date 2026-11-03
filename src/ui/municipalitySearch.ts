import { searchMunicipalities } from '../domain/municipalitySearch.ts';
import type { MunicipalityCode } from '../domain/contracts.ts';

interface MunicipalitySearchElements {
  form: HTMLFormElement;
  input: HTMLInputElement;
  results: HTMLUListElement;
  status: HTMLElement;
  onSelect: (code: MunicipalityCode) => void;
}

/** Vanliga knappar ger tangentbordsval utan egen listbox-/pilknappslogik. */
export function mountMunicipalitySearch({ form, input, results, status, onSelect }: MunicipalitySearchElements) {
  const clearResults = () => {
    results.replaceChildren();
    status.textContent = '';
  };

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    clearResults();
    if (!input.value.trim()) {
      status.textContent = 'Ange kommunnamn eller fyrsiffrig kommunkod.';
      return;
    }
    const matches = searchMunicipalities(input.value);
    status.textContent = matches.length === 0
      ? 'Ingen kommun hittades. Prova ett kommunnamn eller en fyrsiffrig kod, till exempel 0380.'
      : `${matches.length} ${matches.length === 1 ? 'kommun hittad' : 'kommuner hittade'}. Välj en träff nedan.`;
    for (const municipality of matches) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${municipality.name} (${municipality.code})`;
      button.addEventListener('click', () => {
        input.focus();
        clearResults();
        onSelect(municipality.code);
      });
      item.append(button);
      results.append(item);
    }
  };

  form.addEventListener('submit', handleSubmit);
  input.addEventListener('input', clearResults);
  return { clearResults };
}
