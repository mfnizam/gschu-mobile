import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrivasiPageRoutingModule } from './privasi-routing.module';

import { PrivasiPage } from './privasi.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrivasiPageRoutingModule
  ],
  declarations: [PrivasiPage]
})
export class PrivasiPageModule {}
