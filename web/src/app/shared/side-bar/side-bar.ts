import { Component, EventEmitter, OnInit, Output, inject, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { retry, timer } from 'rxjs';
import { ClientApiService, FilterAndSearchService } from '../services';

@Component({
  selector: 'app-side-bar',
  standalone: false,
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBar implements OnInit {
  private breakpointObserver = inject(BreakpointObserver);
  private readonly clientApi = inject(ClientApiService);
  private readonly filterService = inject(FilterAndSearchService);
  private destroyRef = inject(DestroyRef);

  @Output() categorySelected = new EventEmitter<string>();

  // Signals so the view updates when async work (HTTP, breakpoints) finishes; the app is zoneless
  readonly isMobile = signal(false);
  readonly isSidebarOpen = signal(true);
  readonly selectedCategory = signal('All');
  readonly bookCollections = signal<string[]>([]);
  readonly categoriesFailed = signal(false);

  ngOnInit(): void {
    // Determine initial mobile status
    this.isMobile.set(this.breakpointObserver.isMatched([Breakpoints.Handset, Breakpoints.TabletPortrait]));

    // Listen for subsequent screen size changes
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        const wasMobile = this.isMobile();
        this.isMobile.set(result.matches);

        // Only auto-switch open state if crossing the mobile/desktop boundary
        if (wasMobile !== result.matches) {
          this.isSidebarOpen.set(!result.matches);
        }
      });

    this.getCategoryCollectionsData();
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
    this.filterService.updateCategory(category);
    this.categorySelected.emit(category);

    // Auto-close drawer on mobile after selection
    if (this.isMobile()) {
      this.isSidebarOpen.set(false);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((open) => !open);
  }

  /* get Categories Collections Data (retries a couple of times if the API is not ready yet) */
  getCategoryCollectionsData(): void {
    this.categoriesFailed.set(false);
    this.clientApi
      .getCategories()
      .pipe(
        retry({ count: 3, delay: (_err, attempt) => timer(attempt * 1000) }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (categories) => {
          console.log("Categories fetched from API:", categories);
          
          const data: any[] = categories?.success && Array.isArray(categories.data) ? categories.data : [];
          this.bookCollections.set(data.map((item) => item?.name));
        },
        error: (err) => {
          console.error('Failed to fetch categories', err);
          this.bookCollections.set([]);
          this.categoriesFailed.set(true);
        },
      });
  }
}
