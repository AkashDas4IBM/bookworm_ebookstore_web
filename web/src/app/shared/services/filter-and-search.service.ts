import { Injectable, signal } from '@angular/core';

export interface GlobalFilterState {
  search: string;
  category: string;
  language: string;
  format: string;
  priceRange: string;
  sortBy: string;
}

@Injectable({
  providedIn: 'root',
})
export class FilterAndSearchService {
  public filters = signal<GlobalFilterState>({
    search: '',
    category: 'All',
    language: 'All',
    format: 'All',
    priceRange: 'All',
    sortBy: 'Relevance'
  });

  updateSearch(search: string) {
    this.filters.update(state => ({ ...state, search }));
  }

  updateCategory(category: string) {
    this.filters.update(state => ({ ...state, category }));
  }

  updateLanguage(language: string) {
    this.filters.update(state => ({ ...state, language }));
  }

  updateFormat(format: string) {
    this.filters.update(state => ({ ...state, format }));
  }

  updatePriceRange(priceRange: string) {
    this.filters.update(state => ({ ...state, priceRange }));
  }

  updateSortBy(sortBy: string) {
    this.filters.update(state => ({ ...state, sortBy }));
  }
}
