import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'app/services/auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sandiverifikasi',
  templateUrl: './sandiverifikasi.page.html'
})
export class SandiverifikasiPage implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isLoading = false;
  email;
  kadaluarsa;

  emailInvalid = false;

  kodeForm = this._formBuilder.group({
    kode1: [null, Validators.required],
    kode2: [null, Validators.required],
    kode3: [null, Validators.required],
    kode4: [null, Validators.required]
  })

  countdownKode = 0;
  timeoutKode;

  toast;

  constructor(
    private _route: ActivatedRoute,
    private _navCtrl: NavController,
    private _formBuilder: FormBuilder,
    private _auth: AuthService,
    private _loading: LoadingController,
    private _toast: ToastController,
    private _alert: AlertController
  ) {
    this._route.queryParams
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {
        this.email = params.email;
        console.log(params)
        if (this.email) {
          this._auth.lupasandikadaluarsa(this.email)
            .subscribe(async res => {
              console.log(res);
              if (res.email) {
                this.emailInvalid = false;
                this.kodeForm.enable()
                this.kadaluarsa = res.kadaluarsa
                if (this.kadaluarsa) this.countDown();
              } else {
                this.emailInvalid = true;
                this.kodeForm.disable()
                let alert = await this._alert.create({
                  message: 'Email yang anda masukkan tidak valid. Kembali ke halaman sebelumnya.',
                  mode: 'ios',
                  backdropDismiss: false,
                  buttons: [{ text: 'Ke Halaman Sebelumnya' }]
                })
                alert.present();
                await alert.onDidDismiss();
                this._navCtrl.navigateBack('sandilupa');
              }
            }, err => {
              console.log(err)
            })
        }
      })
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  countDown = async () => {
    let jarak = new Date(this.kadaluarsa).getTime() - new Date().getTime();
    if (jarak > 0) {
      // this.countdownKode = new Date(jarak);
      this.countdownKode = jarak;
      this.timeoutKode = setTimeout(this.countDown, 1000);
    }
    else {
      // this.countdownKode = new Date(0);
      this.countdownKode = 0;
      clearTimeout(this.timeoutKode)
    }
  }

  onOtpInput(e, next, prev) {
    if (e.inputType?.includes('deleteContent') || e.detail?.inputType?.includes('deleteContent')) return prev ? prev.setFocus() : null;
    if (next) next.setFocus();
    if (e.target?.value?.length > 1) e.target.value = e.target.value.charAt(0);
  }

  async kirimulangkode() {
    let loading = await this._loading.create({
      message: 'Mengirim Ulang Kode Verifikasi...',
      mode: 'ios',
      duration: 120000
    });

    loading.present();

    this._auth.lupasandi(this.email)
      .subscribe(res => {
        console.log(res)
        loading.dismiss();
        this.showMsg((res.success ? 'Berhasil' : 'Gagal') + ' mengirim ulang kode verifikasi. ' + (res.success ? '' : 'Coba lagi.'), res.success ? 'success' : 'danger')
        if (!res.success) return;
        this.kadaluarsa = res.kadaluarsa
        if (this.kadaluarsa) this.countDown();
      }, err => {
        console.log(err)
        loading.dismiss();
        this.showMsg('Gagal mengirim ulang kode verifikasi. Coba lagi.')
      })
  }

  kirim() {
    console.log(this.emailInvalid, this.kodeForm)
    if(this.emailInvalid || this.kodeForm.invalid) return;
    this.isLoading = true;

    let { kode1, kode2, kode3, kode4 } = this.kodeForm.value;
    this._auth.lupasandiverifikasikode(this.email, kode1 + '' + kode2 + '' + kode3 + '' + kode4)
      .subscribe(res => {
        console.log(res)
        this.isLoading = false;
        if (!res.success) return;
        this._navCtrl.navigateForward('/sandibaru', { queryParams: { email: this.email }, replaceUrl: true })
      }, err => {
        console.log(err)
        this.isLoading = false;
        let msg = err.statusMessage == "Unknown Error" || err.statusText == "Unknown Error" ? 'Gagal verifikasi kode. Coba kirim ulang kode' : (err.statusMessage || err.statusText)
        this.showMsg(msg);
      })
  }

  async showMsg(msg, color = 'danger') {
    if (this.toast) this.toast.dismiss();
    this.toast = await this._toast.create({
      message: msg,
      mode: 'ios',
      duration: 3000,
      color,
      cssClass: 'toast-footer',
      buttons: [{ icon: 'close' }]
    })

    this.toast.present();
  }

}
