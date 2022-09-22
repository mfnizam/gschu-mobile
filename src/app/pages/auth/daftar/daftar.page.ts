import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'app/services/auth/auth.service';

@Component({
  selector: 'app-daftar',
  templateUrl: './daftar.page.html'
})
export class DaftarPage {
  
  sandiMatchingValidatior: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const sandi = control.get('sandi');
    const confSandi = control.get('confSandi');
    if(confSandi.value?.length > 0 && sandi?.value != confSandi?.value) confSandi.setErrors({ tidaksesuai: true })
    return null;
  };
  daftarForm: FormGroup = this._formBuilder.group({
    namaLengkap: [null, [Validators.required]],
    email   : [null, [Validators.required, Validators.email]],
    sandi: [null, [Validators.required]],
    confSandi: [null, [Validators.required]],
  }, { validators: this.sandiMatchingValidatior })

  showSandi = false;
  
  isLoading = false;
  
  toast;

  constructor(
    private _navCtrl: NavController,
    private _formBuilder: FormBuilder,
    private _auth: AuthService,
    private _toast: ToastController) { }

  daftar(){
    if(this.daftarForm.invalid) return;
    this.isLoading = true;

    this._auth.daftar(this.daftarForm.value)
    .subscribe(res => {
      console.log(res)
      this.isLoading = false;
      this._navCtrl.navigateRoot(['/biodata'], { animationDirection: 'forward'})
    }, async err => {
      console.log(err)
      this.isLoading = false;
      if(err.error?.field == 'email') this.daftarForm.get('email').setErrors({ tidaktersedia: true });
      
      if(this.toast) this.toast.dismiss();
      this.toast = await this._toast.create({ 
        message: err.error?.field == 'email'? 'Email sudah terdaftar. Gunakan Email lain.' : 'Terjadi Kesalahan. Coba beberapa saat lagi.', 
        duration: 3000, 
        color: 'danger', 
        mode: 'ios' 
      });
      this.toast.present();
    })
  }

  goBack(){
    this._navCtrl.back();
  }

}
