import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Routes, RouterModule } from '@angular/router';

import { SandiverifikasiPage } from './sandiverifikasi.page';

const routes: Routes = [{ path: '', component: SandiverifikasiPage }];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SandiverifikasiPage]
})
export class SandiverifikasiPageModule {}
