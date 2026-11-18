import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFound } from './shared/page-not-found/page-not-found';
import { authGuard } from './shared/services';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'auth', loadChildren: () => import('./features/auth/auth-module').then((m) => m.AuthModule) },
  { path: 'home', loadChildren: () => import('./features/home/home-module').then((m) => m.HomeModule) },
  { path: 'catalogue', loadChildren: () => import('./features/catalogue/catalogue-module').then((m) => m.CatalogueModule) },
  { path: 'cart', canActivate: [authGuard], loadChildren: () => import('./features/cart/cart-module').then((m) => m.CartModule) },
  { path: 'checkout', canActivate: [authGuard], loadChildren: () => import('./features/checkout/checkout-module').then((m) => m.CheckoutModule) },
  { path: 'orders', canActivate: [authGuard], loadChildren: () => import('./features/orders/orders-module').then((m) => m.OrdersModule) },
  { path: 'wishlist', canActivate: [authGuard], loadChildren: () => import('./features/wishlist/wishlist-module').then((m) => m.WishlistModule) },
  { path: 'writers', canActivate: [authGuard], loadChildren: () => import('./features/writers/writers-module').then((m) => m.WritersModule) },
  { path: '**', component: PageNotFound },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
