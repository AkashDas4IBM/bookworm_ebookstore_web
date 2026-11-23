import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { ClientApiService, WriterDetail as WriterDetailData, apiErrorMessage } from '../../../shared/services';

@Component({
  selector: 'app-writer-detail',
  standalone: false,
  templateUrl: './writer-detail.html',
  styleUrl: './writer-detail.scss',
})
export class WriterDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ClientApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly writer = signal<WriterDetailData | null>(null);
  readonly loading = signal(true);
  readonly message = signal('');
  readonly isError = signal(false);

  constructor() {
    this.route.paramMap
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap((params) => this.api.getWriter(Number(params.get('id')))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (writer) => {
          this.writer.set(writer);
          this.loading.set(false);
        },
        error: () => {
          this.writer.set(null);
          this.loading.set(false);
        },
      });
  }

  toggleFollow(): void {
    const writer = this.writer();
    if (!writer) return;
    const request = writer.following ? this.api.unfollowWriter(writer.id) : this.api.followWriter(writer.id);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.writer.set({ ...writer, following: updated.following });
        this.message.set(
          updated.following ? `${updated.name} added to My Writers.` : `${updated.name} removed from My Writers.`,
        );
        this.isError.set(false);
      },
      error: (err) => {
        this.message.set(apiErrorMessage(err));
        this.isError.set(true);
      },
    });
  }

  hideImage(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }
}
