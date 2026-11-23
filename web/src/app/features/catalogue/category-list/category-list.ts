import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClientApiService } from '../../../shared/services';

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-category-list',
  standalone: false,
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
})
export class CategoryList {
  private readonly api = inject(ClientApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.api
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          // "All" is a sidebar-only pseudo category; the list shows real categories
          this.categories.set((res.data ?? []).filter((c: Category) => c.name !== 'All'));
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
