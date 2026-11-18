import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { WishlistModule } from '../wishlist-module';
import { Wishlist } from './wishlist';

const API = 'http://localhost:8000/api/v1';

const book = (id: number, title: string, price: number, stock = 10) => ({
  id, title, author: 'Some Author', category: 'Self-help', format: 'Paperback', brand: 'Hay House', price, rating: 4.5,
  description: `About ${title}`, image_url: '', back_image_url: null, language: 'English', genre_group: 'Non-fiction',
  author_bio: null, author_image_url: null, stock, popularity: 1, published_date: null,
  tentative_delivery_date: stock > 0 ? '2026-07-21' : null, section: 'recommended',
});

const reply = (data: unknown) => ({ success: true, message: '', data });

describe('Wishlist', () => {
  let fixture: ComponentFixture<Wishlist>;
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem('bookstore.token', 'abc');
    await TestBed.configureTestingModule({
      imports: [WishlistModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Wishlist);
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  const flushWishlist = (books: unknown[]) => {
    http.expectOne(`${API}/wishlist`).flush(reply(books));
    fixture.detectChanges();
  };

  it('lists the wishlisted books', () => {
    flushWishlist([book(1, 'The Art of Focus', 399), book(7, 'The Midnight Hour', 299)]);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('My Wishlist');
    expect(el.querySelectorAll('app-product-card').length).toBe(2);
    expect(el.textContent).toContain('The Midnight Hour');
  });

  it('shows an empty message when nothing is saved', () => {
    flushWishlist([]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Your wishlist is empty');
  });

  it('removes a book from the wishlist', () => {
    flushWishlist([book(1, 'The Art of Focus', 399), book(7, 'The Midnight Hour', 299)]);
    const first = fixture.componentInstance.books()[0];

    fixture.componentInstance.remove(first);
    http.expectOne(`${API}/wishlist/1`).flush(reply([book(7, 'The Midnight Hour', 299)]));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('app-product-card').length).toBe(1);
    expect(el.textContent).toContain('removed from your wishlist');
  });

  it('adds a book to the cart and disables it when out of stock', () => {
    flushWishlist([book(1, 'The Art of Focus', 399), book(18, 'The Living Cell', 27, 0)]);
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('.app-btn.primary')) as HTMLButtonElement[];
    expect(buttons[0].disabled).toBe(false);
    expect(buttons[1].disabled).toBe(true);

    fixture.componentInstance.addToCart(fixture.componentInstance.books()[0]);
    http.expectOne(`${API}/cart/items`).flush(reply({ items: [], summary: { item_count: 1 } }));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('added to your cart');
  });
});
