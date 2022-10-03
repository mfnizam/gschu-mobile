import { NgModule } from '@angular/core';
import { MasterLoadingComponent } from './master.component';
@NgModule({
    declarations: [
        MasterLoadingComponent,
    ],
    exports: [
        MasterLoadingComponent,
    ]
})
export class MasterLoadingModule { }