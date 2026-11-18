import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { SharedModule } from './shared/shared-module';
import { App } from './app';
import { authInterceptor } from './shared/services';

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule, SharedModule],
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient(withInterceptors([authInterceptor]))],
  bootstrap: [App],
})
export class AppModule {}
