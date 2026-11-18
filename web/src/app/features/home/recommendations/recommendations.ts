import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClientApiService, Product } from '../../../shared/services';

/** Books recommended from the categories the customer has ordered before. */
@Component({
  selector: 'app-recommendations',
  standalone: false,
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.scss',
})
export class Recommendations implements OnInit {
  private readonly api = inject(ClientApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly books = signal<Product[]>([]);

  ngOnInit(): void {
    this.api
      .getRecommendations()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (books) => this.books.set(books), error: () => this.books.set([]) });
  }
}
