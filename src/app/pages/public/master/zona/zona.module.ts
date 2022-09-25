import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ZonaPageRoutingModule } from './zona-routing.module';

import { ZonaPage } from './zona.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ZonaPageRoutingModule
  ],
  declarations: [ZonaPage]
})
export class ZonaPageModule {}
