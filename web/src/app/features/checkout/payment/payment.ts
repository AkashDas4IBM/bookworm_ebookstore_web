import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import {
  AuthService,
  CartService,
  CheckoutStateService,
  ClientApiService,
  PayPayload,
  PaymentMethod,
  apiErrorMessage,
} from '../../../shared/services';

/** MM/YYYY that is not in the past. */
function expiryValidator(control: AbstractControl): ValidationErrors | null {
  const match = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(String(control.value ?? ''));
  if (!match) return { expiry: true };
  const now = new Date();
  const year = Number(match[2]);
  const month = Number(match[1]);
  return year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)
    ? { expiry: true }
    : null;
}

/** Step 2 of payment: pick a payment option, pay, and place the order once the payment succeeds. */
@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class Payment implements OnInit {
  private readonly api = inject(ClientApiService);
  private readonly state = inject(CheckoutStateService);
  private readonly cartService = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly payment = this.state.payment;
  readonly methods = signal<PaymentMethod[]>([]);
  readonly selected = signal('credit_card');
  readonly selectedMethod = computed(() => this.methods().find((m) => m.id === this.selected()) ?? null);
  readonly isCard = computed(() => this.selected() === 'credit_card' || this.selected() === 'debit_card');

  readonly processing = signal(false);
  readonly error = signal('');

  readonly cardForm = new FormGroup({
    number: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^(\d{4}-){3}\d{4}$/)] }),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(60)] }),
    cvv: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{3,4}$/)] }),
    expiry: new FormControl('', { nonNullable: true, validators: [Validators.required, expiryValidator] }),
  });
  readonly upiForm = new FormGroup({
    upi_id: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9._-]{2,}@[A-Za-z]{2,}$/)] }),
  });
  readonly walletForm = new FormGroup({
    wallet: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    // Opening this page directly (no address / opened payment) sends the customer back to checkout
    if (!this.state.payment() || !this.state.address()) {
      this.router.navigate(['/checkout']);
      return;
    }
    this.api
      .getPaymentMethods()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (methods) => this.methods.set(methods), error: () => undefined });
  }

  select(id: string): void {
    this.selected.set(id);
    this.error.set('');
  }

  /** Shows the card number as XXXX-XXXX-XXXX-XXXX while typing. */
  formatCardNumber(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16);
    this.cardForm.controls.number.setValue(digits.replace(/(\d{4})(?=\d)/g, '$1-'));
  }

  /** Shows the expiry as MM/YYYY while typing. */
  formatExpiry(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6);
    this.cardForm.controls.expiry.setValue(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  }

  payNow(): void {
    const payment = this.payment();
    const address = this.state.address();
    if (!payment || !address || this.processing()) return;

    const form = this.activeForm();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.processing.set(true);
    this.error.set('');
    // A payment that already succeeded (e.g. the order step failed) is not charged twice
    const pay$ =
      payment.status === 'Paid' && payment.method === this.selected()
        ? of(payment)
        : this.api.pay(payment.id, this.payload());

    pay$
      .pipe(
        switchMap((paid) => {
          this.state.payment.set(paid);
          return this.api.placeOrder({ address, payment_id: paid.id });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ order }) => {
          this.state.clear();
          this.cartService.refresh();
          this.auth.refreshUser();
          this.router.navigate(['/checkout/confirmation', order.id]);
        },
        error: (err) => {
          this.error.set(apiErrorMessage(err));
          this.processing.set(false);
        },
      });
  }

  private activeForm(): FormGroup {
    if (this.isCard()) return this.cardForm;
    return this.selected() === 'upi' ? this.upiForm : this.walletForm;
  }

  private payload(): PayPayload {
    const method = this.selected();
    if (this.isCard()) return { method, card: this.cardForm.getRawValue() };
    if (method === 'upi') return { method, upi_id: this.upiForm.getRawValue().upi_id.trim() };
    return { method, wallet: this.walletForm.getRawValue().wallet };
  }
}
