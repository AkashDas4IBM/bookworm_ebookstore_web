import { Component, inject } from '@angular/core';
import { FilterAndSearchService } from '../../services';

@Component({
  selector: 'app-sort-by-filter-toolbar',
  standalone: false,
  templateUrl: './sort-by-filter-toolbar.html',
  styleUrl: './sort-by-filter-toolbar.scss',
})
export class SortByFilterToolbar {
  public filterService = inject(FilterAndSearchService);
}
