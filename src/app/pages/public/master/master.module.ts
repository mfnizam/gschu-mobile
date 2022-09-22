import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Routes, RouterModule } from '@angular/router';

import { MasterPage } from './master.page';
import { AdminGuard } from 'app/services/auth/auth.guard';

const routes: Routes = [{ 
  path: '', 
  component: MasterPage,
  canActivate: [AdminGuard]
}];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MasterPage]
})
export class MasterPageModule {}