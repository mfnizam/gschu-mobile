import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Platform, IonRouterOutlet, ToastController, NavController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

import { App } from '@capacitor/app';

import { AuthService } from './services/auth/auth.service';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
// import { VersiService } from './services/versi/versi.service';

// import {
//   ActionPerformed,
//   PushNotificationSchema,
//   PushNotifications,
//   Token
// } from '@capacitor/push-notifications';
import { UserService } from './services/user/user.service';

import { Network } from '@capacitor/network';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
      <div id="offlinemsg" class="absolute z-50 w-full bottom-0 left-0 text-center p-1 transition-transform"
        [ngClass]="isOffline? 'bg-dark text-on-dark translate-y-0' : 'bg-success text-on-success translate-y-full delay-1000'">
        {{isOffline? 'Anda Sedang Offline' : 'Anda Kembali Online'}}
      </div>
    </ion-app>
  `
})
export class AppComponent implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet: IonRouterOutlet;
  backCount = 0;
  alert;
  isOffline = false;
  
  constructor(
    private _platform: Platform,
    private _router: Router,
    private _navCtrl: NavController,
    private _toast: ToastController,
    private _auth: AuthService,
    // private _version: VersiService,
    private _alert: AlertController,
    private _user: UserService
  ) {
    this._platform.backButton.subscribeWithPriority(-1, async () => {
      if (this._router.url == '/' && this.backCount < 1) {
        const toast = await this._toast.create({
          message: 'Tekan Sekali Lagi Untuk Keluar.',
          color: 'medium',
          mode: 'ios',
          cssClass: 'toast-tabs',
          duration: 2000,
          buttons: [{ icon: 'close', role: 'cancel' }]
        });
        toast.present();
        this.backCount += 1;
      } else if (this._router.url == '/' && this.backCount > 0) {
        App.exitApp()
      } else if (this._router.url != '/') {
        this.backCount = 0;
      }
    });

    // this._user.user$
    // .pipe(takeUntil(this._unsubscribeAll))
    // .subscribe(async user => {
    // })

    // this.initPushNotification();
    
    // check auth status
    this._auth.authCheck()
      .pipe(first(), takeUntil(this._unsubscribeAll))
      .subscribe()

    // this.checkVersion();

    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);
      this.isOffline = !status.connected;
    });
  }

  ngOnDestroy(): void {
    this._platform.backButton.unsubscribe();
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // checkVersion() {
  //   this._version.getVersion()
  //     .subscribe(async res => {
  //       console.log(res);
  //       if (!res.versi) return;
  //       if (this._platform.is('android') || this._platform.is('ios') || this._platform.is('iphone') || this._platform.is('ipad')) {
  //         let info = await App.getInfo();
  //         let versiUp = res.versi.versi.split('.');
  //         let versiLo = info.version.split('.');
  //         console.log(info);

  //         if (versiUp[0] > versiLo[0]) {
  //           this.showUpdate(res.versi.majorMsg.title, res.versi.majorMsg.msg, res.versi.majorMsg.buttons, false, info.id)
  //         } else if (versiUp[1] > versiLo[1] || versiUp[2] > versiLo[2]) {
  //           this.showUpdate(res.versi.minorMsg.title, res.versi.minorMsg.msg, res.versi.minorMsg.buttons, true, info.id)
  //         } 
  //       }
  //     }, err => {
  //       console.log(err);
  //     })
  // }

  // async showUpdate(
  //   header = 'Update Aplikasi Kamu',
  //   message = 'Yuk Update Aplikasi kamu, biar kamu lebih mudah lagi pesen tiket.. :)',
  //   buttons = [{ text: 'Nanti', role: 'Cancel' }, { text: 'Ya, Update', role: 'ok'}],
  //   backdropDismiss = true,
  //   id = 'com.layspeed.app'
  // ) {
  //   if (this.alert) this.alert.dismiss();
  //   this.alert = await this._alert.create({
  //     header,
  //     message,
  //     buttons,
  //     mode: 'ios',
  //     backdropDismiss
  //   });
  //   await this.alert.present();
  //   let { role } = await this.alert.onDidDismiss();
  //   if (role != 'ok') return;
  //   if (this._platform.is('android')) {
  //     window.open("https://play.google.com/store/apps/details?id=" + id, "_system");
  //   } else if (this._platform.is('ios') || this._platform.is('iphone') || this._platform.is('ipad')) {
  //     window.open("https://apps.apple.com/id/app/" + 'id901804734', '_system')
  //   }
  // }

  // initPushNotification(){
  //   // console.log(this._platform.platforms())
  //   // if(this._platform.is('android') || this._platform.is('ios') || this._platform.is('iphone') || this._platform.is('ipad')){
  //   if(!this._platform.is('mobileweb') && !this._platform.is('desktop')){
  //     // todo: ganti async await dengan try catch
  //     PushNotifications.requestPermissions().then(async result => {
  //       if (result.receive === 'granted') {
  //         await PushNotifications.register();
  //         let listChannel = await PushNotifications.listChannels();
  //         console.log(listChannel)
  //         if(!listChannel.channels.find(v => v.id == 'transaksi')){
  //           await PushNotifications.createChannel({ 
  //             id: 'transaksi', 
  //             name: 'Transaksi', 
  //             importance: 5,
  //             vibration: true
  //           })
  //         }
  //       } else {
  //         // todo: tampilkan alert dengan tombol menuju ke setting permintaan notifikasi
  //       }
  //     }, err => {
  //       console.log(err)
  //     });
  
  //     // all listener
  //     PushNotifications.addListener('registration', async (token: Token) => {
  //       console.log('Push registration success, token: ' + token.value);
  //       // this._user.notifTokenSimpan(token.value).subscribe()
  
  //       // todo: simpan token ke database user ==> { token, waktu, status: aktif/kadaluarsa }[]
  //     });
  
  //     PushNotifications.addListener('registrationError', (error: any) => {
  //       console.log('Error on registration: ', error);
  //       // todo: tampilkan alert dengan tombol menuju ke setting notifikasi
  //     });
  
  //     PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
  //       console.log('Push received: ', notification);
  //       // todo: check channel apakah transaksi, jika transaksi jalankan this._tiket.getTransaksi().subscribe();
  //     });
  
  //     PushNotifications.addListener('pushNotificationActionPerformed', (notif: ActionPerformed) => {
  //       console.log('Push action performed: ', notif);
  //       // this._navCtrl.navigateForward(['/notifikasi/detail/' + notif.data]);
  //       // todo: pindah halaman ke detail notifikasi atau ke halaman sesuai dengan isi notifikasi
  //     });
  //   }

  // }
}
