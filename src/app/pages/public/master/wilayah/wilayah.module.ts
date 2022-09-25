import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WilayahPageRoutingModule } from './wilayah-routing.module';

import { WilayahPage } from './wilayah.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WilayahPageRoutingModule
  ],
  declarations: [WilayahPage]
})
export class WilayahPageModule {}
