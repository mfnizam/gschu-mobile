import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Camera, CameraResultType } from '@capacitor/camera';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { UserService } from 'app/services/user/user.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BerandaService, Kategori } from '../beranda/beranda.service';
import { FormService } from './form.service';

import { serialize } from 'object-to-formdata';
import { PermintaanService } from '../permintaan/permintaan.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-form',
  templateUrl: 'form.page.html',
})
export class FormPage implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  kategori: Kategori;
  title;
  titleColor;

  userForm: FormGroup = this._formBuilder.group({
    _id: [{ value: this._user.user?._id }, [Validators.required]],
    namaLengkap: [{ value: this._user.user?.namaLengkap, disabled: true }, [Validators.required]],
    email: [{ value: this._user.user?.email, disabled: true }, [Validators.required]],
    noPegawai: [{ value: this._user.user?.noPegawai, disabled: true }, [Validators.required]],
    kodeNoTlp: [{ value: this._user.user?.kodeNoTlp, disabled: true }, [Validators.required]],
    noTlp: [{ value: this._user.user?.noTlp, disabled: true }, [Validators.required]],
  })

  idPermintaan;
  permintaan;
  penolak;

  permintaanForm: FormGroup = this._formBuilder.group({});
  minTgl = new Date().toLocaleString('sv').replace(' ', 'T');
  fcmTgl = 'tgl';
  titleTgl = 'Pilih Tanggal ';
  fcmTglVariasi = 'tgl';
  iVariasiModal = 0;
  titleTglVariasi = 'Pilih Tanggal';
  valueWaktu = this.minTgl;
  fcmWaktu = 'waktu';
  titleWaktu = 'Pilih Waktu ';
  showWaktu = false;

  autocomplateForm: FormControl = this._formBuilder.control(null, [Validators.required])
  autocomplateSub: Subscription;
  autocomplateTitle;
  autocomplate = [];
  autocomplateFcn;

  isLoading = false;

  toast;

  constructor(
    private _route: ActivatedRoute,
    private _navCtrl: NavController,
    private _formBuilder: FormBuilder,
    private _beranda: BerandaService,
    private _form: FormService,
    private _permintaan: PermintaanService,
    private _user: UserService,
    private _alert: AlertController,
    private _loading: LoadingController,
    private _toast: ToastController
  ) {
    this._route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {
        this.kategori = this._beranda._kategori.find(v => v.kode == params.kategori);
        console.log(this.kategori)
        if (!this.kategori){ 
          this.showMsg('Tidak dapat memuat form. Coba lagi.', 'danger')
          return this._navCtrl.navigateRoot('/');
        }
        this.idPermintaan = params.id;
        this.initPermintaanForm();
        if (this.idPermintaan) this.ambilPermintaan();
      })
  }

  initPermintaanForm() {
    if (
      this.kategori.kode == 'rdp' ||
      this.kategori.kode == 'furniture' ||
      this.kategori.kode == 'rumput' ||
      this.kategori.kode == 'ac' ||
      this.kategori.kode == 'atk' ||
      this.kategori.kode == 'peralatan'
    ) {
      this.permintaanForm = this._formBuilder.group({
        ...this.idPermintaan ? { _id: [null] } : {},
        alamat: [null, this.kategori.kode != 'rumput' ? Validators.required : []],
        tgl: [null, [Validators.required]],
        variasi: this._formBuilder.array([this.variasi()]),
        catatan: [null],
      })
    } else if (this.kategori.kode == 'snack') {
      let cekperihal: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
        let perihal = group.get('perihal');
        if(Object.values(perihal.value).every(x => !x)) perihal.setErrors({ required: true })
        return null;
      }
      this.permintaanForm = this._formBuilder.group({
        ...this.idPermintaan ? { _id: [null] } : {},
        judul: [null, [Validators.required]],
        tempat: [null, [Validators.required]],
        jumlah: [null, [Validators.required]],
        tgl: [null, [Validators.required]],
        pengambilan: [null, [Validators.required]],
        perihal: this._formBuilder.group({
          snackPagi: [null],
          makanSiang: [null],
          snackSore: [null],
          makanMalam: [null],
        }),
        costCenter: [null],
        GLAccount: [null],
        pic: [null],
        catatan: [null],
      }, { validators: cekperihal })
    } else if (this.kategori.kode == 'krp') {
      this.permintaanForm = this._formBuilder.group({
        ...this.idPermintaan ? { _id: [null] } : {},
        tglKeberangkatan: [null, [Validators.required]],
        tglKembali: [null, [Validators.required]],
        tempatTujuan: [null, [Validators.required]],
        tempatPenjemputan: [null, [Validators.required]],
        waktuPenjemputan: [null, [Validators.required]],
        jumlahPenumpang: [null, [Validators.required]],
        jenisPelayanan: [null, [Validators.required]],
        catatan: [null],
      })
    } else if (this.kategori.kode == 'mess') {
      this.permintaanForm = this._formBuilder.group({
        ...this.idPermintaan ? { _id: [null] } : {},
        penanggungJawab: [null, [Validators.required]],
        checkIn: [null, [Validators.required]],
        checkOut: [null, [Validators.required]],
        jumlahTamu: [null, [Validators.required]],
        jumlahKamar: [null, [Validators.required]],
        catatan: [null]
      })
    } else if (this.kategori.kode == 'dokumen') {
      this.permintaanForm = this._formBuilder.group({
        ...this.idPermintaan ? { _id: [null] } : {},
        tglPengiriman: [null, [Validators.required]],
        namaPengirim: [null, [Validators.required]],
        alamatPengirim: [null, [Validators.required]],
        noTlpPengirim: [null, [Validators.required]],
        namaPenerima: [null, [Validators.required]],
        alamatPenerima: [null, [Validators.required]],
        noTlpPenerima: [null, [Validators.required]],
        jenisDokumen: [null, [Validators.required]],
        catatan: [null],
      })
    } else if (this.kategori.kode == 'galon') {
      this.permintaanForm = this._formBuilder.group({
        ...this.idPermintaan ? { _id: [null] } : {},
        jumlah: [null, [Validators.required]],
        lokasi: [null, [Validators.required]],
        tgl: [null, [Validators.required]],
        waktu: [null, [Validators.required]],
        jenisPelayanan: [null, [Validators.required]],
        catatan: [null],
      })
    } else if (this.kategori.kode == 'acara') {
      this.permintaanForm = this._formBuilder.group({
        ...this.idPermintaan ? { _id: [null] } : {},
        nama: [null, [Validators.required]],
        jenis: [null, [Validators.required]],
        costCenter: [null],
        GLAccount: [null],
        tgl: [null, [Validators.required]],
        waktu: [null, [Validators.required]],
        tempat: [null, [Validators.required]],
        jumlah: [null, [Validators.required]],
        pic: [null, [Validators.required]],
        noTlpPic: [null, [Validators.required]],
        variasi: this._formBuilder.array([this.variasi()]),
        catatan: [null],
      })
    }
  }

  async ambilPermintaan() {
    let loading = await this._loading.create({
      message: 'Memuat data permintaan...',
      mode: 'ios'
    })
    await loading.present()
    this._permintaan.detail(this.idPermintaan)
      .subscribe(res => {
        console.log(res)
        loading.dismiss()
        if (res.permintaan) {
          this.penolak = res.permintaan?.diketahui?.status == 2 ? res.permintaan.diketahui : res.permintaan?.disetujui?.status == 2 ? res.permintaan.disetujui : null;
          // if (this.penolak?.oleh) this.penolak.oleh['inisial'] = this.penolak.oleh.namaLengkap?.match(/(^\S\S?|\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase()
          // if (this.penolak?.oleh?.foto) this.penolak.oleh['foto'] = this.penolak.oleh.foto;

          this.permintaan = res.permintaan.permintaan;
          delete Object.assign(this.permintaan, {
            ['variasi']: this.permintaan[this._form.variasi[res.permintaan?.kategori.kode]]
          })[this._form.variasi[res.permintaan?.kategori.kode]];
          console.log(this.permintaan)

          this.permintaanForm.patchValue(this.permintaan);
          let variasi = this.permintaan.variasi; //res.permintaan.permintaan[this._form.variasi[res.permintaan?..kode]];
          if (variasi) {
            // TODO: foto variasi belum di test
            let variasiForm = (this.permintaanForm.get('variasi') as FormArray);
            variasiForm.clear();
            for (let i = 0; i < variasi.length; i++) {
              variasiForm.push(this.variasi())
              variasiForm.controls[i].patchValue(variasi[i])
            }
          }

          // if (res.permintaan.kategori == 'snack') {
          //   this.permintaan.perihal.forEach(value => {
          //     this.pilihPerihal({ detail: { checked: true, value } })
          //   });
          // }
        } else {
          this.showMsg(null, 'Gagal memuat data permintaan coba beberapa saat lagi.')
        }
      }, err => {
        loading.dismiss()
        this.showMsg(err, 'Gagal memuat data permintaan coba beberapa saat lagi.')
      })
  }

  variasi() {
    let group: FormGroup;
    if (this.kategori.kode == 'rdp' || this.kategori.kode == 'ac') {
      group = this._formBuilder.group({
        _id: [null],
        jenis: [null, [Validators.required]],
        foto: [null],
      })
    } else if (this.kategori.kode == 'furniture' || this.kategori.kode == 'atk' || this.kategori.kode == 'peralatan') {
      group = this._formBuilder.group({
        _id: [null],
        nama: [null, [Validators.required]],
        jumlah: [null, [Validators.required]],
        satuan: [null, [Validators.required]],
      })
    } else if (this.kategori.kode == 'rumput') {
      group = this._formBuilder.group({
        _id: [null],
        lokasi: [null, [Validators.required]],
        foto: [null]
      })
    } else if (this.kategori.kode == 'acara') {
      group = this._formBuilder.group({
        _id: [null],
        nama: [null, [Validators.required]],
        jumlah: [null, [Validators.required]],
        satuan: [null, [Validators.required]],
        tgl: [null, [Validators.required]],
      })
    }
    return group;
  }

  tambahVariasi() {
    (this.permintaanForm.get('variasi') as FormArray).push(this.variasi())
  }

  async hapusVariasi(i) {
    let alert = await this._alert.create({
      message: 'Apakah anda yakin ingin menghapus Variasi Perbaikan ini?',
      mode: 'ios',
      cssClass: 'item-' + this.kategori.kode,
      buttons: [{ text: 'Batal', role: 'cancel' }, { text: 'Hapus', role: 'ok' }]
    });
    await alert.present();
    let { role } = await alert.onDidDismiss();
    if (role == 'ok') (this.permintaanForm.get('variasi') as FormArray).removeAt(i)
  }

  bukaTgl(modal, title?, fcmTglName?) {
    if (title) this.titleTgl = 'Pilih Tanggal ' + title;
    if (fcmTglName) this.fcmTgl = fcmTglName;
    modal.present();
  }
  bukaTglVariasi(modal, title, i, fcmTglName?) {
    this.iVariasiModal = i;
    if (title) this.titleTglVariasi = 'Pilih Tanggal ' + title;
    if (fcmTglName) this.fcmTglVariasi = fcmTglName;
    modal.present();
  }
  pilihVariasiTgl(modal, tgl) {
    this.permintaanForm.get('variasi')['controls'][this.iVariasiModal].get(this.fcmTglVariasi).setValue(tgl.value)
    modal.dismiss();
  }
  bukaWaktu(modal, title?, fcmWaktuName = 'waktu') {
    if (title) this.titleWaktu = 'Pilih Waktu ' + title;
    if (fcmWaktuName) this.fcmWaktu = fcmWaktuName;
    this.valueWaktu = this.permintaanForm.get(fcmWaktuName).value;
    modal.present();
    setTimeout(_ => { this.showWaktu = true; }, 100)
  }
  dismissWaktu() { this.showWaktu = false; }
  pilihWaktu(modal) {
    modal.dismiss();
    this.permintaanForm.get(this.fcmWaktu).setValue(this.valueWaktu);
  }

  bukaAutocomplete(modal, setfrom, setTo) {
    this.autocomplateFcn = setTo;
    this.autocomplateTitle = setfrom;
    this.autocomplate = this._form[setfrom];
    modal.present();
    this.autocomplateSub = this.autocomplateForm.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(value => {
        this.autocomplate = this._form[setfrom].filter(v => v.nama.toLowerCase().includes(value?.toLowerCase()))
      })
  }
  dismissAutocomplate() {
    this.autocomplateForm.reset()
    this.autocomplateSub.unsubscribe();
  }
  pilihAutocomplate(value) {
    this.autocomplateForm.setValue(value)
  }
  simpanAutocomplate(modal) {
    this.autocomplateSub.unsubscribe();
    this.autocomplateFcn.setValue(this.autocomplateForm.value)
    modal.dismiss();
  }

  async ambilFoto(setTo: FormControl) {
    const image = await Camera.getPhoto({
      quality: 100,
      width: 1080,
      allowEditing: false,
      resultType: CameraResultType.Base64, //CameraResultType.Uri,
      promptLabelPhoto: 'Pilih Dari Galeri',
      promptLabelPicture: 'Ambil Dari Kamera'
    });

    setTo.setValue("data:image/jpeg;base64," + image.base64String)

    // let foto = await fetch("data:image/jpeg;base64," + image.base64String).then(res => res.blob());
    // setTo.setValue(foto);

    // this.imgUbahFoto = this._sanitizer.bypassSecurityTrustResourceUrl(image.webPath);
    // this.imgUbahFoto = "data:image/jpeg;base64," + image.base64String; // image.webPath;

  }

  bukaKonfirmasi(modal) {
    if (this.permintaanForm.invalid) return;
    modal.present();
  }

  async kirim(modal) {
    if (this.permintaanForm.invalid) return;
    this.isLoading = true;

    let loading = await this._loading.create({
      message: 'Mengirim permintaan anda...',
      mode: 'ios',
      backdropDismiss: false
    });
    await modal.dismiss();
    await loading.present();


    let value = JSON.parse(JSON.stringify(this.permintaanForm.value));
    let variasiFormData = new FormData();
    if (value.variasi) {
      for (var i = 0; i < value.variasi.length; i++) {
        if(!value.variasi[i]._id) delete value.variasi[i]._id;
        if (!value.variasi[i]?.foto) continue;

        let cekfoto = this.permintaan?.variasi?.find(v => v._id == value.variasi[i]._id);
        if (value.variasi[i]?.foto == cekfoto?.foto) continue;

        let foto = await fetch(value.variasi[i].foto).then(res => res.blob()).catch(err => null);
        if(!foto) continue;
        variasiFormData.append("variasi[" + i + "]['foto']", foto, this.kategori.kode + i);
        value.variasi[i].fotoNama = this.kategori.kode + i;
        delete value.variasi[i].foto;
      }
    }

    const formData: FormData = serialize({ kategori: this.kategori._id, jenis: this.kategori.kode, ...value }, { indices: true }, variasiFormData);

    if (this.idPermintaan && value._id) {
      //TODO: sebelum dikirim ke server perlu dicek apakah ada data yg diubah.. implementasikan ini juga pada form jadi tombol nonaktif jika tidak ada yg berubah
      this._permintaan.ubah(formData)
        .subscribe(res => {
          console.log(res);
          this.isLoading = false;
          loading.dismiss();
          this._navCtrl.navigateBack(['/detail/permintaan/' + this.idPermintaan], { replaceUrl: true })
        }, async err => {
          console.log(err)
          this.isLoading = false;
          loading.dismiss();

          this.showMsg(err, 'Gagal mengubah permintaan. Coba beberapa saat lagi')
        })
    } else {
      this._permintaan.tambah(formData)
        .subscribe(res => {
          console.log(res);
          this.isLoading = false;
          loading.dismiss();
          this._navCtrl.navigateForward(['/permintaan'], { replaceUrl: true })
        }, async err => {
          console.log(err)
          this.isLoading = false;
          loading.dismiss();

          if (this.toast) this.toast.dismiss();
          this.toast = await this._toast.create({
            message: 'Gagal mengirim permintaan. Coba beberapa saat lagi',
            duration: 3000,
            color: 'danger',
            mode: 'ios',
            buttons: [{ icon: 'close' }]
          });
          this.toast.present();
        })
    }
  }

  async showMsg(err, msg = 'Gagal memuat data permintaan. Coba beberapa saat lagi', color = 'danger') {
    //console.log(err)
    this.isLoading = false;

    if (this.toast) this.toast.dismiss();
    this.toast = await this._toast.create({
      message: msg,
      duration: 3000,
      color,
      mode: 'ios',
      buttons: [{ icon: 'close' }]
    });
    this.toast.present();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  trackByFn(index: number, item: any): any {
    return item._id || index;
  }

}
