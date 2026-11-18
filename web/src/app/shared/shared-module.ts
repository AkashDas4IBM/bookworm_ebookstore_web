import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';

import { Header } from './header/header';
import { Footer } from './footer/footer';
import { ProductCard } from './product-card/product-card';
import { PageNotFound } from './page-not-found/page-not-found';
import { SideBar } from './side-bar/side-bar';
import { FilterAndSearchToolbar } from './filter-and-search-toolbar/filter-and-search-toolbar';
import { BookSearchToolbar } from './filter-and-search-toolbar/book-search-toolbar/book-search-toolbar';
import { LanguageFilterToolbar } from './filter-and-search-toolbar/language-filter-toolbar/language-filter-toolbar';
import { FormatFilterToolbar } from './filter-and-search-toolbar/format-filter-toolbar/format-filter-toolbar';
import { PriceRangeFilterToolbar } from './filter-and-search-toolbar/price-range-filter-toolbar/price-range-filter-toolbar';
import { SortByFilterToolbar } from './filter-and-search-toolbar/sort-by-filter-toolbar/sort-by-filter-toolbar';

const MATERIAL = [
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatRadioModule,
  MatBadgeModule,
  MatSnackBarModule,
  MatChipsModule,
  MatListModule,
  MatSidenavModule,
];

@NgModule({
  declarations: [
    Header,
    Footer,
    ProductCard,
    PageNotFound,
    SideBar,
    FilterAndSearchToolbar,
    BookSearchToolbar,
    LanguageFilterToolbar,
    FormatFilterToolbar,
    PriceRangeFilterToolbar,
    SortByFilterToolbar,
  ],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, ...MATERIAL],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ...MATERIAL,
    Header,
    Footer,
    ProductCard,
    PageNotFound,
    SideBar,
    FilterAndSearchToolbar,
    BookSearchToolbar,
    LanguageFilterToolbar,
    FormatFilterToolbar,
    PriceRangeFilterToolbar,
    SortByFilterToolbar,
  ],
})
export class SharedModule {}
