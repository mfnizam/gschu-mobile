import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Platform, IonRouterOutlet, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { App } from '@capacitor/app';

import { AuthService } from './services/auth/auth.service';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token
} from '@capacitor/push-notifications';

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
export class AppComponent implements OnDestroy, OnInit {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet: IonRouterOutlet;
  backCount = 0;
  alert;
  isOffline = false;

  constructor(
    private _platform: Platform,
    private _router: Router,
    private _toast: ToastController,
    private _auth: AuthService,
  ) { }

  ngOnInit() {
    // check auth status
    this._auth.authCheck()
      .pipe(first(), takeUntil(this._unsubscribeAll))
      .subscribe()

    // network listener
    Network.addListener('networkStatusChange', status => {
      console.log('Network status changed', status);
      this.isOffline = !status.connected;
    });

    // init back button for exiting app
    this.initBackButtonExit();

    if(!this._platform.is('capacitor')) return;

    // register Push Notification
    this.registerPushNotification();

    // init push notification
    this.initPushNotification();
  }

  ngOnDestroy(): void {
    this._platform.backButton.unsubscribe();
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  initBackButtonExit() {
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
  }

  async registerPushNotification() {
    console.log('register')
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }

    await PushNotifications.register()
  }

  async initPushNotification() {
    await PushNotifications.addListener('registration', token => {
      console.info('Registration token: ', token.value);
    });

    await PushNotifications.addListener('registrationError', err => {
      console.error('Registration error: ', err.error);
    });

    await PushNotifications.addListener('pushNotificationReceived', notification => {
      console.log('Push notification received: ', notification);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
      console.log('Push notification action performed', notification.actionId, notification.inputValue);
    });

  }

  async getDeliveredNotifications() {
    const notificationList = await PushNotifications.getDeliveredNotifications();
    console.log('delivered notifications', notificationList);
  }
}
