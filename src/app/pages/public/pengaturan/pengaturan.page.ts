import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { PengaturanService } from './pengaturan.service';

@Component({
  selector: 'app-pengaturan',
  templateUrl: './pengaturan.page.html'
})
export class PengaturanPage implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  total: { fungsi: number, jabatan: number } = { fungsi: 0, jabatan: 0 };

  constructor(
    private _pengaturan: PengaturanService
  ) {
    this._pengaturan.semuatotal()
      .subscribe(res => {
        console.log(res)
        this.total = res.total;
      }, err => {
        console.log(err)
      })
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
