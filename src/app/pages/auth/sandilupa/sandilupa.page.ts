import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'app/services/auth/auth.service';

@Component({
  selector: 'app-sandilupa',
  templateUrl: './sandilupa.page.html'
})
export class SandilupaPage {

  isLoading = false;
  emailForm = this._formBuilder.control(null, [Validators.required, Validators.email])

  constructor(
    private _formBuilder: FormBuilder,
    private _navCtrl: NavController,
    private _auth: AuthService,
    private _toast: ToastController
  ) { }

  kirim() {
    if (this.emailForm.invalid) return;
    this.isLoading = true;

    this._auth.lupasandi(this.emailForm.value)
      .subscribe(res => {
        console.log(res)
        this.isLoading = false
        if(res.success){
          this._navCtrl.navigateForward(['/sandiverifikasi'], { queryParams: { email: this.emailForm.value } })
        } else {
          this.showMsg()
        }
      }, err => {
        console.log(err);
        this.isLoading = false
        // this.daftarForm.setErrors({ msg: (err.statusMessage || err.statusText) });
        let msg = err.statusMessage == "Unknown Error" || err.statusText == "Unknown Error"? 'Terjadi Kesalahan' : (err.statusMessage || err.statusText)
        this.showMsg(msg);
        this.emailForm.setErrors({ msg })
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
}
