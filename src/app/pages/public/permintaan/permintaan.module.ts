import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { Routes, RouterModule } from '@angular/router';

import { PermintaanPage } from './permintaan.page';

import { CalendarModule } from 'ion2-calendar';

const routes: Routes = [{ path: '', component: PermintaanPage }];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    CalendarModule
  ],
  declarations: [PermintaanPage]
})
export class PermintaanPageModule {}
