import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Routes, RouterModule } from '@angular/router';

import { PersetujuanPage } from './persetujuan.page';
import { PenandatanganGuard } from 'app/services/auth/auth.guard';

const routes: Routes = [{ 
  path: '', 
  component: PersetujuanPage,
  canActivate: [PenandatanganGuard] // TODO: guard harus cek jwt online
}];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PersetujuanPage]
})
export class PersetujuanPageModule {}
