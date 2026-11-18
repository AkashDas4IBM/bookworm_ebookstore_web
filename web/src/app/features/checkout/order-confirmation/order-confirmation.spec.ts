import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CheckoutModule } from '../checkout-module';
import { OrderConfirmation } from './order-confirmation';

const API = 'http://localhost:8000/api/v1';

const item = (id: number, title: string, author: string, price: number) => ({
  product_id: id, title, author, format: 'Paperback', image_url: '', description: `About ${title}`,
  category: 'Non-fiction', genre_group: 'Self Help', quantity: 1, unit_price: price, line_total: price,
});

const ORDER = {
  id: 1004, status: 'Placed', placed_at: '2026-07-16T10:00:00+00:00',
  items: [item(13, 'Joy of Minimalism', 'Daniel Reed', 149), item(3, 'The Path to Success', 'James Wright', 359)],
  subtotal: 508, tax: 60.96, delivery_charge: 0, discount: 0, coupon_code: null, points_redeemed: 0, points_earned: 5,
  total: 568.96, payment_method: 'credit_card', payment_reference: 'TXN1',
  address: { first_name: 'Demo', last_name: 'User', email: 'a@b.c', phone: '+911234567890', line1: '12 Park Street', city: 'Kolkata', state: 'West Bengal', postal_code: '700016', country: 'India' },
  estimated_delivery: '2026-07-21', cancellable: true, cancel_deadline: '2026-07-18T10:00:00+00:00',
};

describe('OrderConfirmation', () => {
  let fixture: ComponentFixture<OrderConfirmation>;
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem('bookstore.token', 'abc');
    await TestBed.configureTestingModule({
      imports: [CheckoutModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1004' })) } },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(OrderConfirmation);
    fixture.detectChanges();
    http.expectOne(`${API}/orders/1004`).flush({ success: true, message: '', data: ORDER });
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('announces the purchase and lists every book with its price and delivery date', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.message')?.textContent).toContain('Your purchase of the following reads is successful');

    const books = Array.from(el.querySelectorAll('.book'));
    expect(books.length).toBe(2);
    expect(books[0].textContent).toContain('Joy of Minimalism');
    expect(books[0].textContent).toContain('Daniel Reed');
    expect(books[0].textContent).toContain('₹149');
    expect(books[0].textContent).toContain('Paperback');
    expect(books[1].textContent).toContain('The Path to Success');
    expect(books[1].textContent).toContain('₹359');
    expect(books[1].textContent).toContain('Delivery by Tue, 21 Jul');
  });

  it('offers Continue your Shopping and the 48-hour cancel', () => {
    const el: HTMLElement = fixture.nativeElement;
    const link = el.querySelector('.continue-btn') as HTMLAnchorElement;
    expect(link.textContent).toContain('Continue your Shopping');
    expect(link.getAttribute('href')).toBe('/home');
    expect(el.textContent).toContain('48 hrs');
  });

  it('switches to the cancelled message after the order is cancelled', () => {
    fixture.componentInstance.cancel();
    http.expectOne(`${API}/orders/1004/cancel`).flush({
      success: true, message: '', data: { ...ORDER, status: 'Cancelled', cancellable: false, cancel_deadline: null },
    });
    http.match(() => true).forEach((r) => r.flush({ success: true, message: '', data: null }));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.message')?.textContent).toContain('Your order has been cancelled');
    expect(el.textContent).not.toContain('Delivery by');
    expect(el.querySelector('.app-btn.danger')).toBeNull();
  });
});
