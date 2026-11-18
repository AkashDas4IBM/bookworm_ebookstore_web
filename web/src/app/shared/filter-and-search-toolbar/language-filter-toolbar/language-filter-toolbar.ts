import { Component, inject } from '@angular/core';
import { FilterAndSearchService } from '../../services';

@Component({
  selector: 'app-language-filter-toolbar',
  standalone: false,
  templateUrl: './language-filter-toolbar.html',
  styleUrl: './language-filter-toolbar.scss',
})
export class LanguageFilterToolbar {
  public filterService = inject(FilterAndSearchService);
}
