import { Injectable, signal } from '@angular/core';
import { PaymentIntent, ShippingAddress } from './client-api.service';

/** Carries the delivery address and the opened payment from the checkout page to the payment screen. */
@Injectable({ providedIn: 'root' })
export class CheckoutStateService {
  readonly address = signal<ShippingAddress | null>(null);
  readonly payment = signal<PaymentIntent | null>(null);

  clear(): void {
    this.address.set(null);
    this.payment.set(null);
  }
}
