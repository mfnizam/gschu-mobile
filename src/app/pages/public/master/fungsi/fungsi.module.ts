import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FungsiPageRoutingModule } from './fungsi-routing.module';

import { FungsiPage } from './fungsi.page';
import { MasterLoadingModule } from 'app/shared/loading/master/master.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FungsiPageRoutingModule,
    MasterLoadingModule
  ],
  declarations: [FungsiPage]
})
export class FungsiPageModule {}
