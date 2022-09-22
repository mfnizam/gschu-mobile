import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BerandaPage } from './beranda.page';

import { FormPage } from 'app/pages/public/form/form.page';
import { FormGuard } from 'app/services/auth/auth.guard';


const routes: Routes = [{ 
  path: '', component: BerandaPage 
},{ 
  path: 'form/:kategori', component: FormPage, canActivate: [FormGuard] 
}, {
  path: 'form/:kategori/:id', component: FormPage, canActivate: [FormGuard] 
}];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [BerandaPage, FormPage]
})
export class BerandaPageModule {}
