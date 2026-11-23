import { Component, inject } from '@angular/core';
import { FilterAndSearchService } from '../../services';

@Component({
  selector: 'app-book-search-toolbar',
  standalone: false,
  templateUrl: './book-search-toolbar.html',
  styleUrl: './book-search-toolbar.scss',
})
export class BookSearchToolbar {
  public filterService = inject(FilterAndSearchService);
}
