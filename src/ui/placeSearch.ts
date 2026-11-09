import { municipalityDirectory } from '../data/municipalities.ts';
import { groupPlacesByMunicipality } from '../domain/placeSearch.ts';
import { createPlaceSearch } from '../state/placeSearch.ts';

interface PlaceSearchElements {
  form: HTMLFormElement;
  input: HTMLInputElement;
  filter: HTMLSelectElement;
  results: HTMLUListElement;
  status: HTMLElement;
  attribution: HTMLElement;
  onSelectMunicipality: (code: string) => void;
  search?: ReturnType<typeof createPlaceSearch>;
}

export function mountPlaceSearch({ form, input, filter, results, status, attribution,
  onSelectMunicipality, search = createPlaceSearch() }: PlaceSearchElements) {
  for (const municipality of [...municipalityDirectory].sort((a, b) => a.name.localeCompare(b.name, 'sv'))) {
    const option = document.createElement('option');
    option.value = municipality.code;
    option.textContent = `${municipality.name} (${municipality.code})`;
    filter.append(option);
  }
  const unsubscribe = search.subscribe(state => {
    results.replaceChildren();
    attribution.replaceChildren();
    status.removeAttribute('aria-busy');
    if (state.status === 'idle') { status.textContent = ''; return; }
    if (state.status === 'loading') {
      status.textContent = 'Söker platser…';
      status.setAttribute('aria-busy', 'true');
      return;
    }
    if (state.status === 'error') { status.textContent = state.error.message; return; }
    attribution.textContent = state.data.attribution.join(' · ');
    if (state.status === 'empty') { status.textContent = state.reason; return; }
    const spread = state.data.spridning;
    const spreadText = spread
      ? ` API:t anger ${spread.traffar} exakta namnträffar i ${spread.kommuner} kommuner före träffgränsen.` : '';
    status.textContent = `${state.data.results.length} platsträffar visas, grupperade per kommun.${spreadText} `
      + 'Högst 20 träffar visas; listan är inte fullständig. Begränsa till en kommun vid behov.';
    for (const group of groupPlacesByMunicipality(state.data.results)) {
      const item = document.createElement('li');
      const name = document.createElement('strong');
      name.textContent = group.code ? `${group.municipalityName} (${group.code})` : group.municipalityName;
      const places = document.createElement('p');
      places.textContent = `${group.places.join(' · ')} — ${group.count} visade träffar`;
      item.append(name, places);
      if (group.code) {
        const code = group.code;
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `Välj ${group.municipalityName} kommun (${code})`;
        button.addEventListener('click', () => {
          input.focus();
          onSelectMunicipality(code);
        });
        item.append(button);
      }
      results.append(item);
    }
  });
  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    void search.submit(input.value, filter.value || undefined);
  };
  form.addEventListener('submit', submit);
  input.addEventListener('input', search.clear);
  filter.addEventListener('change', search.clear);
  return {
    clearResults: search.clear,
    destroy() {
      unsubscribe();
      search.clear();
      form.removeEventListener('submit', submit);
      input.removeEventListener('input', search.clear);
      filter.removeEventListener('change', search.clear);
    },
  };
}
