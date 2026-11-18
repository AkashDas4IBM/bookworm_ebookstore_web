import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { AuthService, CartService, ClientApiService, Product, Review, apiErrorMessage } from '../../../shared/services';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ClientApiService);
  private readonly auth = inject(AuthService);
  private readonly cartService = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);

  readonly maxReviewLength = 100;
  readonly starIndexes = [0, 1, 2, 3, 4];

  readonly book = signal<Product | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly actionMessage = signal('');

  readonly reviewForm = new FormGroup({
    comment: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(this.maxReviewLength)],
    }),
    rating: new FormControl(0, { nonNullable: true, validators: [Validators.min(1), Validators.max(5)] }),
  });

  constructor() {
    // Reload whenever the :id route param changes (e.g. clicking a related book)
    this.route.paramMap
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.actionMessage.set('');
          this.reviewForm.reset({ comment: '', rating: 0 });
        }),
        switchMap((params) => this.api.getProduct(Number(params.get('id')))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (book) => {
          this.book.set(book);
          this.loading.set(false);
          this.loadReviews(book.id);
        },
        error: () => {
          this.book.set(null);
          this.loading.set(false);
        },
      });
  }

  ratingRounded(): number {
    return Math.round(this.book()?.rating ?? 0);
  }

  setRating(value: number): void {
    this.reviewForm.controls.rating.setValue(value);
  }

  submitReview(): void {
    const book = this.book();
    if (!book || this.reviewForm.invalid) return;
    this.submitting.set(true);
    const { comment, rating } = this.reviewForm.getRawValue();
    this.api
      .addReview(book.id, { comment: comment.trim(), rating })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (review) => {
          this.reviews.update((list) => [review, ...list]);
          this.reviewForm.reset({ comment: '', rating: 0 });
          this.submitting.set(false);
        },
        error: () => this.submitting.set(false),
      });
  }

  /** Customers must be logged in (or register) before a book can go in the cart. */
  addToCart(): void {
    const book = this.book();
    if (!book) return;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.cartService
      .add(book.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.actionMessage.set(`"${book.title}" added to cart.`),
        error: (err) => this.actionMessage.set(apiErrorMessage(err)),
      });
  }

  /** Saves the book to the user's wishlist (login required, like the cart). */
  addToWishlist(): void {
    const book = this.book();
    if (!book) return;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.api
      .addToWishlist(book.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.actionMessage.set(`"${book.title}" added to wishlist.`),
        error: (err) => this.actionMessage.set(apiErrorMessage(err)),
      });
  }

  hideImage(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }

  private loadReviews(id: number): void {
    this.api
      .getReviews(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (reviews) => this.reviews.set(reviews), error: () => this.reviews.set([]) });
  }
}
