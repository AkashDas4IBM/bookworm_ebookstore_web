import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared-module';
import { HomeRoutingModule } from './home-routing-module';
import { Home } from './home/home';
import { OrderHistoryWidget } from './order-history-widget/order-history-widget';
import { Recommendations } from './recommendations/recommendations';

@NgModule({
  declarations: [
    Home,
    OrderHistoryWidget,
    Recommendations
  ],
  imports: [CommonModule, SharedModule, HomeRoutingModule],
})
export class HomeModule {}
