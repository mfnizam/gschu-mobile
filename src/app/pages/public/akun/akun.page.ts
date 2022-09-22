import { Component, OnDestroy } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'app/services/auth/auth.service';
import { User, UserService } from 'app/services/user/user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AkunService } from './akun.service';

import { Camera, CameraResultType } from '@capacitor/camera';
import { MasterService } from '../master/master.service';

@Component({
  selector: 'app-akun',
  templateUrl: './akun.page.html'
})
export class AkunPage implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  user: User;

  imgUbahFoto;

  titleUbah;
  fcmUbah;
  inputUbah;
  ubahLoading = false;
  ufLoading = false;

  constructor(
    private _navCtrl: NavController,
    private _auth: AuthService,
    private _user: UserService,
    private _toast: ToastController,
    private _akun: AkunService,
    private _master: MasterService
  ) {
    this._user.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(user => {
        this.user = JSON.parse(JSON.stringify(user));
        console.log(this.user)
        if (this.user?.fungsi) this.user.fungsi.tipe = this._master.tipeFungsi.find(v => v._id == user.fungsi?.tipe)?.nama;
      })
    
    this._akun.akun()
    .subscribe(res => {
      console.log(res)
    }, err => {
      console.log(err)
    })
  }

  async ubahFoto(modal) {
    // let permission = await Camera.requestPermissions({ permissions: ['camera', 'photos']})
    // console.log(permission);

    const image = await Camera.getPhoto({
      quality: 60,
      allowEditing: true,
      resultType: CameraResultType.Base64, //CameraResultType.Uri,
      promptLabelPhoto: 'Pilih Dari Galeri',
      promptLabelPicture: 'Ambil Dari Kamera'
    });
    
    await modal.present();
    
    // this.imgUbahFoto = this._sanitizer.bypassSecurityTrustResourceUrl(image.webPath);
    this.imgUbahFoto = "data:image/jpeg;base64," + image.base64String; // image.webPath;

  }
  dismissUbahFoto() {}
  batalUbahFoto(modal) {
    if(this.ufLoading) return;
    modal.dismiss()
    this.imgUbahFoto = null;
  }
  async simpanFoto(modal){
    if(this.imgUbahFoto){
      this.ufLoading = true;
      let foto = await fetch(this.imgUbahFoto).then(res => res.blob());
      this._akun.uploadFoto(foto)
      .subscribe(res => {
        console.log(res)
        this.ufLoading = false;
        modal.dismiss();
      }, async err => {
        console.log(err)
        modal.dismiss();
        this.ufLoading = false;
        let toast = await this._toast.create({ message: 'Gagal Menyimpan Foto', mode: 'ios', duration: 3000, color: 'danger', buttons: [{ icon: 'close' }] });
        toast.present();
      })
    }
  }

  bukaUbah(modal, title, fcm) {
    modal.present();
    this.titleUbah = title;
    this.fcmUbah = fcm;
    this.inputUbah = this.user[fcm];
  }

  dismissUbah() {
    this.titleUbah = null;
    this.fcmUbah = null;
    this.inputUbah = null;
  }

  async simpanUbah(modal) {
    if (!this.inputUbah) {
      let toast = await this._toast.create({ message: 'Isikan ' + this.titleUbah, mode: 'ios', duration: 3000, color: 'warning', buttons: [{ icon: 'close' }] });
      toast.present();
      return;
    };
    this.ubahLoading = true;

    this._akun.simpan({ [this.fcmUbah]: this.inputUbah })
      .subscribe(res => {
        //console.log(res)
        this.ubahLoading = false;
        modal.dismiss();
      }, async err => {
        //console.log(err)
        this.ubahLoading = false;
        let toast = await this._toast.create({ message: 'Gagal Menyimpan ' + this.titleUbah, mode: 'ios', duration: 3000, color: 'danger', buttons: [{ icon: 'close' }] });
        toast.present();
      })
  }

  async keluar(modal?) {
    if(modal) await modal.dismiss()
    this._auth.keluar();
    await this._navCtrl.navigateRoot('/masuk', { animationDirection: 'forward' })
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
