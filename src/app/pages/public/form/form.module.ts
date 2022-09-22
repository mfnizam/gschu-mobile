import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormPage } from './form.page';
import { FormGuard } from 'app/services/auth/auth.guard';

const routes: Routes = [{ 
  path: '', component: FormPage, canActivate: [FormGuard] 
}, {
  path: ':id', component: FormPage, canActivate: [FormGuard] 
}];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FormPage]
})
export class FormPageModule {}
