import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  private readonly router = inject(Router);

  protected readonly title = signal('bookstore-web');

  /** The global search/filter toolbar only applies to the home page listing. */
  readonly isHome = signal(this.isHomeUrl(this.router.url));

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => this.isHome.set(this.isHomeUrl(e.urlAfterRedirects)));
  }

  /** Category chosen in the sidebar: the filter state is updated by the sidebar itself; bring the user to the listing. */
  onGenreChange(_category: string): void {
    if (!this.isHome()) {
      this.router.navigateByUrl('/home');
    }
  }

  private isHomeUrl(url: string): boolean {
    const path = url.split(/[?#]/)[0];
    return path === '/' || path === '/home';
  }
}
