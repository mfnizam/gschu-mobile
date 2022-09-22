import { ChangeDetectorRef, Component, NgZone, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { UserService } from 'app/services/user/user.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { MasterService } from '../master/master.service';
import { BiodataService } from './biodata.service';

@Component({
  selector: 'app-biodata',
  templateUrl: './biodata.page.html'
})
export class BiodataPage implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  isUbah =  Boolean(this._route.snapshot.queryParams.ubah);

  biodataForm: FormGroup = this._formBuilder.group({
    _id: [this._user.user?._id, [Validators.required]],
    namaLengkap: [{ value: this._user.user?.namaLengkap, disabled: !this.isUbah }, [Validators.required]],
    email   : [{ value: this._user.user?.email, disabled: !this.isUbah }, [Validators.required, Validators.email]],
    noTlp: [this._user.user?.noTlp, [Validators.required]],
    noPegawai: [this._user.user?.noPegawai, [Validators.required]],
    
    organisasi: [this._user.user?.fungsi?.organisasi?._id, [Validators.required]], 
    organisasiNama: [this._user.user?.fungsi?.organisasi?.nama, [Validators.required]], 
    
    fungsi: [this._user.user?.fungsi?._id, [Validators.required]],
    fungsiNama: [this._user.user?.fungsi?.nama, [Validators.required]],
    // fungsiJenis: [this._master.jenisFungsi.find(v => v._id == this._user.user?.fungsi?.jenis)?.nama, [Validators.required]],
    
    // organisasi: [{ 
    //   value: this._user.user?.fungsi?.organisasi?.nama + (this._user.user?.fungsi?.organisasi?.zona? ' - ' + this._user.user?.fungsi?.organisasi?.zona?.nama : ''), 
    //   disabled: true 
    // }, [Validators.required]],
    
    jabatan: [this._user.user?.jabatan?._id, [Validators.required]],
    jabatanNama: [this._user.user?.jabatan?.nama, [Validators.required]],
  });

  isLoading = false;

  isPilihanLoading = false;
  pilihan: any /* gnti dengan interface */ = [];
  pilihanTitle = 'Pilih';
  pilihanFcn;
  pilihanFcnNama;
  terpilih;

  pilihanPencarian = this._formBuilder.control(null)

  toast;

  constructor(
    private _route: ActivatedRoute,
    private _navCtrl: NavController,
    private _formBuilder: FormBuilder,
    private _user: UserService,
    private _biodata: BiodataService,
    private _master: MasterService,
    private _toast: ToastController
  ) {
    this.biodataForm.get('organisasi').valueChanges
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(value => {
      this.biodataForm.patchValue({
        fungsi: null,
        fungsiNama: null,
      })
    })

    this.biodataForm.get('fungsi').valueChanges
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(value => {
      this.biodataForm.patchValue({
        jabatan: null,
        jabatanNama: null,
      })
    })

    this.pilihanPencarian.valueChanges
    .pipe(takeUntil(this._unsubscribeAll), debounceTime(300))
    .subscribe(value => {
      // console.log(value, 'pencarian');
      if(value !== null) this.ambilPilihan(value? { nama: { "$regex": value, "$options": "i" } } : null)
    })
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  bukaPilihan(modal, title, fcn, fcnNama, url?) {
    if(fcn == 'jabatan' && !this.biodataForm.get('fungsi').value) {
      this.showToast('Pilih Fungsi terlebih dahulu')
      return
    }

    this.pilihanFcn = fcn;
    this.pilihanFcnNama = fcnNama;
    this.pilihanTitle = title;

    this.ambilPilihan();
    modal.present();
  }
  dismissPilihan() {
    this.pilihan = [];
    this.pilihanFcn = null;
    this.pilihanFcnNama = null;
    this.pilihanTitle = null;
    this.terpilih = null;
    this.pilihanPencarian.reset()
  }
  pilihPilihan(modal) {
    if (!this.terpilih) return;
    if(this.biodataForm.get(this.pilihanFcn).value == this.terpilih._id) return modal.dismiss()

    this.biodataForm.get(this.pilihanFcn).setValue(this.terpilih._id);
    this.biodataForm.get(this.pilihanFcnNama).setValue(this.terpilih.nama)

    modal.dismiss();
  }

  ambilPilihan(filter?){
    this.isPilihanLoading = true;
    console.log(this.pilihanFcn)
    this._biodata.pilihan(this.pilihanFcn, {
      ...this.pilihanFcn == 'fungsi'? { organisasi: this.biodataForm.get('organisasi').value } : {},
      ...this.pilihanFcn == 'jabatan'? { fungsi: this.biodataForm.get('fungsi').value } : {},
      ...filter
    }
    )
    .subscribe(res => {
      console.log(res);
      this.isPilihanLoading = false;
      this.pilihan = res[this.pilihanFcn]
      let isupdate = this.biodataForm.get(this.pilihanFcn).value;
      if (isupdate) this.terpilih = this.pilihan.find(v => v._id == isupdate);
    }, err => {
      console.log(err)
      this.isPilihanLoading = false;
      // TODO: tambah toast
    })
  }

  simpan(){
    if(this.biodataForm.invalid) return;
    this.isLoading = true;

    this._biodata.simpan(this.biodataForm.value)
    .subscribe(res => {
      // console.log(res)
      this.isLoading = false;
      let redirect = this._route.snapshot.queryParams.redirect
      if(redirect?.includes('/akun')){
        this._navCtrl.navigateBack(this._route.snapshot.queryParams.redirect, { animationDirection: 'back' })
      } else if(redirect?.includes('/form')){
        this._navCtrl.navigateForward(this._route.snapshot.queryParams.redirect, { replaceUrl: true })
      } else{
        this._navCtrl.navigateRoot('/', { animationDirection: 'forward' })
      }
    }, err => {
      // console.log(err)
      this.isLoading = false;
      this.showToast(err.error?.field == 'email'? 'Email sudah terdaftar. Gunakan Email lain.' : 'Terjadi Kesalahan. Coba beberapa saat lagi.')
    })
  }
  
  async showToast(msg, color = 'danger'){
    if(this.toast) this.toast.dismiss();
    this.toast = await this._toast.create({ 
      message: msg, 
      duration: 3000, 
      color, 
      mode: 'ios',
      buttons: [{ icon: 'close'}]
    });
    this.toast.present();
  }
}
