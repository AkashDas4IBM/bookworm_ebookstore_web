import { Component, inject } from '@angular/core';
import { FilterAndSearchService } from '../../services';

@Component({
  selector: 'app-price-range-filter-toolbar',
  standalone: false,
  templateUrl: './price-range-filter-toolbar.html',
  styleUrl: './price-range-filter-toolbar.scss',
})
export class PriceRangeFilterToolbar {
  public filterService = inject(FilterAndSearchService);
}
