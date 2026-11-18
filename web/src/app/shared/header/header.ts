import { Component, EventEmitter, Output, inject } from '@angular/core';
import { AuthService, CartService } from '../services';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);

  @Output() menuClicked = new EventEmitter<void>();

  onMenuClick(): void {
    this.menuClicked.emit();
  }

  logout(): void {
    this.auth.logout();
  }
}
