import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { CheckoutStateService } from '../../../shared/services';
import { CheckoutModule } from '../checkout-module';
import { Payment } from './payment';

const API = 'http://localhost:8000/api/v1';
const ADDRESS = {
  first_name: 'Demo', last_name: 'User', email: 'demo@bookstore.com', phone: '+919876543210',
  line1: '12 Park Street', city: 'Kolkata', state: 'West Bengal', postal_code: '700016', country: 'India',
};
const METHODS = [
  { id: 'credit_card', label: 'Credit Card', description: '', options: [] },
  { id: 'debit_card', label: 'Debit card', description: '', options: [] },
  { id: 'upi', label: 'UPI', description: '', options: [] },
  { id: 'wallet', label: 'Wallet', description: '', options: ['Paytm'] },
];

describe('Payment', () => {
  let fixture: ComponentFixture<Payment>;
  let component: Payment;
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem('bookstore.token', 'abc');
    await TestBed.configureTestingModule({
      imports: [CheckoutModule],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const state = TestBed.inject(CheckoutStateService);
    state.address.set(ADDRESS);
    state.payment.set({
      id: 'pay_1', amount: 580, status: 'Initiated', method: null, coupon_code: null,
      points_to_redeem: 0, reference: null, message: '',
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Payment);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(`${API}/checkout/payment-methods`).flush({ success: true, message: '', data: METHODS });
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('shows the payable amount and the four payment options', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Complete Payment');
    expect(el.textContent).toContain('₹580');
    expect(Array.from(el.querySelectorAll('.pay-tabs button')).map((b) => b.textContent?.trim())).toEqual([
      'Credit Card', 'Debit card', 'UPI', 'Wallet',
    ]);
  });

  it('formats the card number and expiry while typing', () => {
    const input = document.createElement('input');
    input.value = '4111111111111111';
    component.formatCardNumber({ target: input } as unknown as Event);
    expect(component.cardForm.controls.number.value).toBe('4111-1111-1111-1111');
    input.value = '122099';
    component.formatExpiry({ target: input } as unknown as Event);
    expect(component.cardForm.controls.expiry.value).toBe('12/2099');
  });

  it('does not call the API while the card form is invalid', () => {
    component.payNow();
    http.expectNone(`${API}/checkout/payments/pay_1/pay`);
    expect(component.cardForm.controls.number.touched).toBe(true);
  });

  it('pays, then places the order and opens the confirmation', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.cardForm.setValue({ number: '4111-1111-1111-1111', name: 'Demo User', cvv: '123', expiry: '12/2099' });
    component.payNow();

    const pay = http.expectOne(`${API}/checkout/payments/pay_1/pay`);
    expect(pay.request.body.method).toBe('credit_card');
    pay.flush({ success: true, message: '', data: { id: 'pay_1', amount: 580, status: 'Paid', method: 'credit_card', coupon_code: null, points_to_redeem: 0, reference: 'TXN1', message: '' } });

    const place = http.expectOne(`${API}/checkout/place-order`);
    expect(place.request.body.payment_id).toBe('pay_1');
    place.flush({ success: true, message: '', data: { order: { id: 1004 }, gift_points: 100 } });

    http.match(() => true).forEach((r) => r.flush({ success: true, message: '', data: null }));
    expect(navigate).toHaveBeenCalledWith(['/checkout/confirmation', 1004]);
  });

  it('shows the gateway message when the payment is declined', () => {
    component.cardForm.setValue({ number: '4000-0000-0000-0002', name: 'Demo User', cvv: '123', expiry: '12/2099' });
    component.payNow();
    http.expectOne(`${API}/checkout/payments/pay_1/pay`).flush(
      { success: false, message: 'Your bank declined the payment.' },
      { status: 402, statusText: 'Payment Required' },
    );
    expect(component.error()).toContain('declined');
    expect(component.processing()).toBe(false);
  });
});
