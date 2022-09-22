import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'app/services/auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sandibaru',
  templateUrl: './sandibaru.page.html'
})
export class SandibaruPage  implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  
  showSandi = false;
  isLoading = false;

  email;
  emailInvalid = false;

  sandiMatchingValidatior: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const sandi = group.get('sandi');
    const konfirmasiSandi = group.get('konfirmasiSandi');
    if(konfirmasiSandi.value?.length > 0 && sandi?.value != konfirmasiSandi?.value) konfirmasiSandi.setErrors({ tidaksesuai: true, msg: 'Konfirmasi Sandi Tidak Sesuai' })
    return null;
  };

  sandiForm = this._formBuilder.group({
    sandi: [null, Validators.required],
    konfirmasiSandi: [null, Validators.required]
  }, { validators: this.sandiMatchingValidatior })

  constructor(
    private _route: ActivatedRoute,
    private _navCtrl: NavController,
    private _formBuilder: FormBuilder,
    private _auth: AuthService,
    private _alert: AlertController,
    private _toast: ToastController
  ) {
    this._route.queryParams
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {
        this.email = params.email;
        console.log(params)
        if (this.email) {
          this._auth.lupasandikodeterverifikasi(this.email)
            .subscribe(async res => {
              console.log(res);
              if (res.email) {
                this.emailInvalid = false;
              } else {
                this.emailInvalid = true;
                this.showAlert('Email yang anda masukkan tidak valid. Kembali ke halaman sebelumnya.')
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

  kirim(){
    if(this.sandiForm.invalid) return;
    this.isLoading = true;
    this._auth.sandibaru(this.email, this.sandiForm.get('sandi').value)
    .subscribe(res => {
      console.log(res)
      this.isLoading = false;
      if(!res.success) return;
      this._navCtrl.navigateForward('/sandipemberitahuan', { replaceUrl: true });
    }, err => {
      console.log(err)
      this.isLoading = false;
      let msg = err.statusMessage == "Unknown Error" || err.statusText == "Unknown Error"? 'Terjadi Kesalahan' : (err.statusMessage || err.statusText)
      err.error.show == 'alert'? this.showAlert(msg) : this.showMsg(msg)
    })
  }

  async showMsg(msg = 'Terjadi Kesalahan. Coba lagi.'){
    let toast = await this._toast.create({
      message: msg,
      mode: 'ios',
      color: 'danger',
      duration: 3000,
      cssClass: 'toast-footer',
      buttons: [{ icon: 'close' }]
    })
    await toast.present()
  }

  async showAlert(msg = 'Ubah sandi tidak valid. Ulangi proses ubah sandi'){
    let alert = await this._alert.create({
      message: msg,
      mode: 'ios',
      backdropDismiss: false,
      buttons: [{ text: 'Ke Halaman Sebelumnya' }]
    })
    alert.present();
    await alert.onDidDismiss();
    this._navCtrl.navigateBack('sandilupa');
  }
}
