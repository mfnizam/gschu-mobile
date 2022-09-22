import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { NotifService } from './notif.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notif',
  templateUrl: './notif.page.html'
})
export class NotifPage  implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  idNotif;
  notif;

  isLoading = true;

  constructor(
    private _route: ActivatedRoute,
    private _notif: NotifService
  ) {
    this._route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {
        this.idNotif = params.id;
        this.ambilNotif();
        this._notif.dibaca(this.idNotif)
        .subscribe(res => null, err => null)
      })
  }

  ionViewDidEnter(){
    let skeleton = document.getElementById('loading-notif');
    if(skeleton) skeleton.classList.add('skeleton')
  }

  ambilNotif(refresher?){
    this.isLoading = true;
    this._notif.notif(this.idNotif)
    .subscribe(res => {
      console.log(res);
      this.isLoading = false;
      if(refresher) refresher.target.complete();
      this.notif = res.notifikasi;
    }, err => {
      console.log(err)
      this.isLoading = false;
      if(refresher) refresher.target.complete();
    })
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
