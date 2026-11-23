import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService, ClientApiService, FormOptions, apiErrorMessage } from '../../../shared/services';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(ClientApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly options = signal<FormOptions | null>(null);
  readonly submitting = signal(false);
  readonly error = signal('');

  readonly form = new FormGroup({
    first_name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    last_name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    country_code: new FormControl('+91', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^[0-9]{7,12}$/)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8), Validators.maxLength(64)] }),
    confirm: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  get returnUrl(): string {
    return this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
  }

  get passwordsMatch(): boolean {
    return this.form.controls.password.value === this.form.controls.confirm.value;
  }

  ngOnInit(): void {
    this.api
      .getFormOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (options) => this.options.set(options), error: () => undefined });
  }

  submit(): void {
    if (this.form.invalid || !this.passwordsMatch) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set('');
    const v = this.form.getRawValue();
    this.auth
      .register({
        first_name: v.first_name.trim(),
        last_name: v.last_name.trim(),
        email: v.email.trim(),
        password: v.password,
        phone: v.phone ? `${v.country_code}${v.phone}` : undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl),
        error: (err) => {
          this.error.set(apiErrorMessage(err));
          this.submitting.set(false);
        },
      });
  }
}
