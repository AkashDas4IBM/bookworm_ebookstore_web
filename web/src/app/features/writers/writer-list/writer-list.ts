import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClientApiService, Writer, apiErrorMessage } from '../../../shared/services';

@Component({
  selector: 'app-writer-list',
  standalone: false,
  templateUrl: './writer-list.html',
  styleUrl: './writer-list.scss',
})
export class WriterList implements OnInit {
  private readonly api = inject(ClientApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly writers = signal<Writer[]>([]);
  readonly loading = signal(true);
  readonly message = signal('');
  readonly isError = signal(false);

  readonly myWriters = computed(() => this.writers().filter((w) => w.following));
  readonly otherWriters = computed(() => this.writers().filter((w) => !w.following));

  ngOnInit(): void {
    this.api
      .getWriters()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (writers) => {
          this.writers.set(writers);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.show(apiErrorMessage(err), true);
        },
      });
  }

  toggleFollow(writer: Writer): void {
    const request = writer.following ? this.api.unfollowWriter(writer.id) : this.api.followWriter(writer.id);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.writers.update((list) => list.map((w) => (w.id === updated.id ? updated : w)));
        this.show(
          updated.following ? `${updated.name} added to My Writers.` : `${updated.name} removed from My Writers.`,
          false,
        );
      },
      error: (err) => this.show(apiErrorMessage(err), true),
    });
  }

  hideImage(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }

  private show(text: string, isError: boolean): void {
    this.message.set(text);
    this.isError.set(isError);
  }
}
