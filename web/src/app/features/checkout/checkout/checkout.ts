import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AuthService,
  CartService,
  CheckoutStateService,
  ClientApiService,
  Coupon,
  PriceSummary,
  apiErrorMessage,
} from '../../../shared/services';
import { createAddressForm } from '../address-select/address-select';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  private readonly api = inject(ClientApiService);
  private readonly cartService = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly checkoutState = inject(CheckoutStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly cart = this.cartService.cart;
  readonly firstBook = computed(() => this.cart()?.items[0]?.product ?? null);
  readonly addressForm = createAddressForm();

  readonly coupons = signal<Coupon[]>([]);
  readonly couponInput = signal('');
  readonly appliedCoupon = signal<string | null>(null);
  readonly pointsRedeemed = signal(0);
  /** Re-priced summary (coupon + points); falls back to the cart's own summary. */
  readonly pricing = signal<PriceSummary | null>(null);
  readonly summary = computed(() => this.pricing() ?? this.cart()?.summary ?? null);
  readonly giftPoints = computed(() => this.auth.user()?.gift_points ?? 0);

  readonly couponMessage = signal('');
  readonly couponIsError = signal(false);
  readonly error = signal('');
  readonly paying = signal(false);

  ngOnInit(): void {
    this.cartService.refresh();
    this.reprice();
    this.api
      .getCoupons()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (c) => this.coupons.set(c), error: () => undefined });
  }

  changeQuantity(productId: number, quantity: number): void {
    this.error.set('');
    const call =
      quantity < 1 ? this.cartService.remove(productId) : this.cartService.setQuantity(productId, quantity);
    call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.reprice(),
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }

  applyCoupon(): void {
    const code = this.couponInput().trim();
    this.couponMessage.set('');
    if (!code) {
      this.appliedCoupon.set(null);
      this.reprice();
      return;
    }
    this.api
      .getCheckoutSummary(code, this.pointsRedeemed())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (s) => {
          this.pricing.set(s);
          this.appliedCoupon.set(s.coupon_code);
          this.couponIsError.set(false);
          this.couponMessage.set(`Coupon ${s.coupon_code} applied.`);
        },
        error: (err) => {
          this.couponIsError.set(true);
          this.couponMessage.set(apiErrorMessage(err));
        },
      });
  }

  redeemPoints(points: number): void {
    this.api
      .getCheckoutSummary(this.appliedCoupon(), points)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (s) => {
          this.pricing.set(s);
          this.pointsRedeemed.set(s.points_redeemed);
        },
        error: (err) => this.error.set(apiErrorMessage(err)),
      });
  }

  payNow(): void {
    this.error.set('');
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.error.set('Please complete the delivery address.');
      return;
    }
    if (!this.cart()?.items.length) {
      this.error.set('Your cart is empty.');
      return;
    }
    const { country_code, phone, ...rest } = this.addressForm.getRawValue();
    this.paying.set(true);
    // Step 1 of payment: lock the payable amount, then pick the payment option on the next screen
    this.api
      .initiatePayment(this.appliedCoupon(), this.pointsRedeemed())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (payment) => {
          this.checkoutState.address.set({ ...rest, phone: `${country_code}${phone}` });
          this.checkoutState.payment.set(payment);
          this.router.navigate(['/checkout/payment']);
        },
        error: (err) => {
          this.error.set(apiErrorMessage(err));
          this.paying.set(false);
        },
      });
  }

  hideImage(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }

  private reprice(): void {
    this.api
      .getCheckoutSummary(this.appliedCoupon(), this.pointsRedeemed())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (s) => {
          this.pricing.set(s);
          this.pointsRedeemed.set(s.points_redeemed);
        },
        error: () => {
          // The coupon may no longer qualify after a quantity change
          if (this.appliedCoupon()) {
            this.appliedCoupon.set(null);
            this.couponMessage.set('Coupon removed: the order no longer qualifies.');
            this.couponIsError.set(true);
            this.reprice();
          }
        },
      });
  }
}
