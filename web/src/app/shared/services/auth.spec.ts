import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';
import { authInterceptor } from './auth.interceptor';

describe('auth', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
  });

  afterEach(() => localStorage.clear());

  it('stores the token and user after login', () => {
    const http = TestBed.inject(HttpTestingController);
    const auth = TestBed.inject(AuthService);
    expect(auth.isLoggedIn()).toBe(false);

    auth.login('demo@bookstore.com', 'Password@123').subscribe();
    http.expectOne('http://localhost:8000/api/v1/auth/login').flush({
      success: true,
      message: 'ok',
      data: { access_token: 'abc', token_type: 'bearer', user: { id: 1, first_name: 'Demo', gift_points: 250 } },
    });

    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.user()?.first_name).toBe('Demo');
    expect(localStorage.getItem('bookstore.token')).toBe('abc');
  });

  it('guard redirects anonymous users to login with a returnUrl', () => {
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, { url: '/cart' } as any));
    expect(result instanceof UrlTree).toBe(true);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/auth/login?returnUrl=%2Fcart');
  });

  it('guard allows logged-in users', () => {
    localStorage.setItem('bookstore.token', 'abc');
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, { url: '/cart' } as any));
    expect(result).toBe(true);
  });

  it('interceptor adds the Bearer token', () => {
    localStorage.setItem('bookstore.token', 'abc');
    const http = TestBed.inject(HttpClient);
    const ctrl = TestBed.inject(HttpTestingController);
    http.get('/anything').subscribe();
    expect(ctrl.expectOne('/anything').request.headers.get('Authorization')).toBe('Bearer abc');
  });
});
