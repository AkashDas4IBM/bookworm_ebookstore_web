import { Component, Input } from '@angular/core';
import { Product } from '../services';

@Component({
  selector: 'app-product-card',
  standalone: false,
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  @Input({ required: true }) book!: Product;
  /** Small label printed on the cover (e.g. "Book", "Bestseller", "New"). */
  @Input() label = 'Book';
}
