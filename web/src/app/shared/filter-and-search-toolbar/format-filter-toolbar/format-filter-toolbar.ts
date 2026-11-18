import { Component, inject } from '@angular/core';
import { FilterAndSearchService } from '../../services';

@Component({
  selector: 'app-format-filter-toolbar',
  standalone: false,
  templateUrl: './format-filter-toolbar.html',
  styleUrl: './format-filter-toolbar.scss',
})
export class FormatFilterToolbar {
  public filterService = inject(FilterAndSearchService);
}
