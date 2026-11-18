import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared-module';
import { AuthRoutingModule } from './auth-routing-module';
import { Login } from './login/login';
import { Register } from './register/register';

@NgModule({
  declarations: [
    Login,
    Register
  ],
  imports: [CommonModule, SharedModule, AuthRoutingModule],
})
export class AuthModule {}
