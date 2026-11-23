import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, ClientApiService, RegisterPayload, User } from './client-api.service';

const TOKEN_KEY = 'bookstore.token';
const USER_KEY = 'bookstore.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ClientApiService);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly user = signal<User | null>(this.readUser());
  readonly isLoggedIn = computed(() => !!this.token());

  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.login(email, password).pipe(tap((res) => this.store(res)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.api.register(payload).pipe(tap((res) => this.store(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.user.set(null);
    this.router.navigate(['/home']);
  }

  /** Re-reads the profile (e.g. to refresh gift points after an order). */
  refreshUser(): void {
    this.api.getMe().subscribe({ next: (user) => this.setUser(user), error: () => undefined });
  }

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  /** Clears the session without navigating (used when the API says the token is no longer valid). */
  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.user.set(null);
  }

  private store(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.access_token);
    this.token.set(res.access_token);
    this.setUser(res.user);
  }

  private readUser(): User | null {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null');
    } catch {
      return null;
    }
  }
}
