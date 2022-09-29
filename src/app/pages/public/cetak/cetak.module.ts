import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CetakPageRoutingModule } from './cetak-routing.module';

import { CetakPage } from './cetak.page';
import { CalendarModule } from 'ion2-calendar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CetakPageRoutingModule,
    CalendarModule
  ],
  declarations: [CetakPage]
})
export class CetakPageModule {}
