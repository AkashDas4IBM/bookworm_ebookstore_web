import { Component, DestroyRef, Input, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Address, AuthService, ClientApiService, FormOptions } from '../../../shared/services';

export function createAddressForm() {
  return new FormGroup({
    first_name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    last_name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    line1: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    city: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(60)] }),
    postal_code: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[0-9]{6}$/)] }),
    country_code: new FormControl('+91', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[0-9]{7,12}$/)] }),
    state: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    country: new FormControl('India', { nonNullable: true, validators: [Validators.required] }),
  });
}

export type AddressForm = ReturnType<typeof createAddressForm>;

/** The "Address" panel of the checkout page: delivery details with an optional saved address. */
@Component({
  selector: 'app-address-select',
  standalone: false,
  templateUrl: './address-select.html',
  styleUrl: './address-select.scss',
})
export class AddressSelect implements OnInit {
  private readonly api = inject(ClientApiService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) form!: AddressForm;

  readonly options = signal<FormOptions | null>(null);
  readonly saved = signal<Address[]>([]);
  readonly useSaved = signal(false);
  readonly selectedSavedId = signal<number | null>(null);

  ngOnInit(): void {
    const user = this.auth.user();
    if (user) {
      this.form.patchValue({ first_name: user.first_name, last_name: user.last_name, email: user.email });
      this.setPhone(user.phone);
    }
    this.api
      .getFormOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (options) => this.options.set(options), error: () => undefined });
    this.api
      .getAddresses()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (list) => this.saved.set(list), error: () => undefined });
  }

  get states(): string[] {
    return this.options()?.states[this.form.controls.country.value] ?? [];
  }

  onCountryChange(): void {
    this.form.controls.state.setValue('');
  }

  toggleSaved(checked: boolean): void {
    this.useSaved.set(checked);
    if (checked && this.saved().length) this.chooseSaved(this.selectedSavedId() ?? this.saved()[0].id);
  }

  chooseSaved(id: number): void {
    const address = this.saved().find((a) => a.id === id);
    if (!address) return;
    this.selectedSavedId.set(id);
    this.form.patchValue({
      line1: address.line1,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
    });
  }

  private setPhone(phone: string | null): void {
    if (!phone) return;
    const codes = (this.options()?.country_codes ?? [{ code: '+91' }, { code: '+1' }, { code: '+44' }])
      .map((c) => c.code)
      .sort((a, b) => b.length - a.length);
    const match = codes.find((c) => phone.startsWith(c));
    this.form.patchValue(
      match
        ? { country_code: match, phone: phone.slice(match.length) }
        : { phone: phone.replace(/^\+/, '') },
    );
  }
}
