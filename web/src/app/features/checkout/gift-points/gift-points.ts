import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Lets the customer redeem gift points (1 point = ₹1); the parent re-prices the order. */
@Component({
  selector: 'app-gift-points',
  standalone: false,
  templateUrl: './gift-points.html',
  styleUrl: './gift-points.scss',
})
export class GiftPoints {
  @Input() balance = 0;
  @Input() redeemed = 0;
  @Output() redeem = new EventEmitter<number>();
}
