import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FungsiPageRoutingModule } from './fungsi-routing.module';

import { FungsiPage } from './fungsi.page';
import { MasterLoadingComponent } from 'app/shared/loading/master/master.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FungsiPageRoutingModule
  ],
  declarations: [FungsiPage, MasterLoadingComponent]
})
export class FungsiPageModule {}
