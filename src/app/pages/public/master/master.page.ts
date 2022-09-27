import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { environment } from 'environments/environment';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MasterService } from './master.service';

/* 
  BUG:
    - ketika penyetuju atau atasan sudah dihapus dari fungsi, data permintaan masih tersambung dengan penyetuju atau atasan
      contoh: user A (Fungsi Satu) mengirimkan permintaan, atasan user A pada Fungsi Satu adalah user B,
              ketika user B sudah dihapus/diganti sebagai atasan pada Fungsi Satu maka permintaan tersebut 
              masih menyambung user B dan tidak di pindahkan ke atasan baru
  TODO: 
    - tambah atasan pada jabatan - update
    - tambah atasan pada jabatan - create
*/

@Component({
  selector: 'app-master',
  templateUrl: './master.page.html'
})
export class MasterPage implements OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private _unsubscribeForm: Subject<any> = new Subject<any>();

  jenis: any /* ganti dengan interface */ = {};

  wilayah: any /* gnti dengan interface */ = [];
  // wilayahSub: Subscription;
  fungsi: any /* gnti dengan interface */ = [];
  master: any /* gnti dengan interface */ = [];

  masterId;
  aksiId;

  isPilihanLoading = false;
  pilihan: any /* gnti dengan interface */ = [];
  pilihanTitle = 'Pilih';
  pilihanFcn;
  pilihanFcnNama;
  terpilih;

  isLoading = false;
  tambahForm: FormGroup = this._formBuilder.group({});
  isTambahLoading = false;
  isFpLoading = false; // fungsi penyetuju loading

  constructor(
    private _route: ActivatedRoute,
    private _master: MasterService,
    private _formBuilder: FormBuilder,
    private _alert: AlertController,
    private _loading: LoadingController
  ) {
    this._route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {
        this.jenis = this._master.jenis.find(v => v.kode == params.jenis) || {};
        this.ambilMaster();
      })
  }

  ionViewDidEnter() {
    let skeleton = document.getElementById('loading-master');
    if (skeleton) skeleton.classList.add('skeleton')
  }

  ambilMaster(jenis = this.jenis.kode, filter = null, set = 'master', loading = true) {
    this.isLoading = loading;
    this._master.data(jenis, filter)
      .subscribe(res => {
        console.log(res);
        this[set] = res[jenis].map(v => ({
          ...v,
          // ...v.namaLengkap ? { inisial: v.namaLengkap?.match(/(^\S\S?|\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase() } : {},
          ...v.nama ? { nama: v.nama.replace(/\\n/g, '') } : {},
        }));

        // if(this.jenis.kode == 'fungsi'){
        //   this[set] = this.groupMaster(res.master, 'organisasi', 'organisasiNama') //res.master;
        // }
        
        if (this.pilihanFcn) {
          let isupdate = this.tambahForm.get(this.pilihanFcn).value;
          if (isupdate) this.terpilih = this.pilihan.find(v => v._id == isupdate);
        }

        this.isLoading = false;
        this.isPilihanLoading = false;
      }, async err => {
        console.log(err)
        this.isLoading = false;
        this.isPilihanLoading = false;
        // TODO: add toast
      })
  }

  // mastergroupby = (list, key) => list.reduce((hash, obj) => ({...hash, [obj[key]]:( hash[obj[key]] || [] ).concat(obj)}), {})

  groupMaster(arr: any, property, propertyNama) {
    arr = arr.map(v => ({ ...v, [propertyNama]: (v[property]?.delete ? '~' : '') + v[property]?.nama }))
    // .sort((a, b) => a.provinsi.nama > b.provinsi.nama? -1 : 1); 

    let arrObj = arr.reduce(function (a, x) {
      if (!a[x[propertyNama]]) { a[x[propertyNama]] = []; }
      a[x[propertyNama]].push(x);
      return a;
    }, {});

    arr = [];
    for (var key in Object.keys(arrObj).reduce((acc, k) => ((!arrObj[k] || arrObj[k].length < 1) && delete acc[k], acc), arrObj)) {
      arr.push({ _id: 'divider', nama: key.replace('~', ''), kode: key.replace('~', ''), disabled: key.substring(0, 1) == '~' });
      arr.push(...arrObj[key])
    }
    return arr
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();

    this._unsubscribeForm.next();
    this._unsubscribeForm.complete();
  }

  bukaAksi(modal, id) {
    this.aksiId = id;
    modal.present();
  }
  dismissAksi() {
    this.aksiId = null;
  }

  bukaTambah(modal, _id?) {
    let master = _id ? this.master.find(v => v._id == _id) : null;
    
    if (this.jenis.kode == 'zona') {
      this.tambahForm = this._formBuilder.group({
        nama: [(master?.nama || null), [Validators.required]]
      });
    } else if (this.jenis.kode == 'wilayah') {
      this.tambahForm = this._formBuilder.group({
        nama: [(master?.nama || null), [Validators.required]],
        zona: [(master?.zona?._id || null), [Validators.required]],
        zonaNama: [(master?.zona?.nama || null), [Validators.required]],
      });
    } else if (this.jenis.kode == 'fungsi') {
      console.log(master)
      this.tambahForm = this._formBuilder.group({
        nama: [(master?.nama || null), [Validators.required]],
        kode: [master?.kode, [Validators.required]],
        // tipe: [(master?.organisasi?.tipe || null), [Validators.required]],
        organisasi: [(master?.organisasi?._id || null), [Validators.required]],
        organisasiNama: [(master?.organisasi?.nama || null)],

        ttdAtasan: [master?.ttdAtasan],
        atasan: [master?.atasan?._id],
        atasanData: [master?.atasan ? {
          ...master.atasan,
          // inisial: master.atasan.namaLengkap?.match(/(^\S\S?|\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase()
        } : null],

        // ttdPenyetuju: [!!master?.penyetuju],
        penyetuju: [master?.penyetuju?._id],
        penyetujuData: [master?.penyetuju ? {
          ...master.penyetuju,
          // inisial: master.penyetuju.namaLengkap?.match(/(^\S\S?|\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase()
        } : null],
      });

      this.tambahForm.get('ttdAtasan').valueChanges
        .pipe(takeUntil(this._unsubscribeForm))
        .subscribe(value => {
          this.tambahForm.patchValue({ atasan: null, atasanData: null })
        })
      // this.tambahForm.get('ttdPenyetuju').valueChanges
      //   .pipe(takeUntil(this._unsubscribeForm))
      //   .subscribe(value => {
      //     this.tambahForm.patchValue({ penyetuju: null, penyetujuData: null })
      //   })
    } else if (this.jenis.kode == 'jabatan') {
      let organisasi = master?.fungsi?.organisasi;
      console.log(master)
      this.tambahForm = this._formBuilder.group({
        organisasi: [organisasi?._id, [Validators.required]],
        organisasiNama: [organisasi?.nama, [Validators.required]],
        fungsi: [master?.fungsi?._id, [Validators.required]],
        fungsiNama: [master?.fungsi?.nama, [Validators.required]],
        nama: [master?.nama, [Validators.required]],
        tersediaAtasan: [{ value: !master?.fungsi?.ttdAtasan, disabled: true }], // TODO: sesiakan tersediaAtasan pada saat "penambahan jabatan baru"
        atasan: [master?.atasan?._id],
        atasanData: [master?.atasan ? {
          ...master.atasan,
          // inisial: master.atasan.namaLengkap?.match(/(^\S\S?|\b\S)?/g).join("").match(/(^\S|\S$)?/g).join("").toUpperCase()
        } : null],
      });
      this.tambahForm.get('organisasi').valueChanges
        .pipe(takeUntil(this._unsubscribeForm))
        .subscribe(value => {
          this.tambahForm.patchValue({ fungsi: null, fungsiNama: null })
        })
    } else if (this.jenis.kode == 'penyetuju') {
      this.tambahForm = this._formBuilder.group({
        wilayah: [(master?.wilayah?._id || null), [Validators.required]],
        wilayahNama: [(master?.wilayah?.nama || null), [Validators.required]],
        user: [(master?.nama || null), [Validators.required]],
        userData: [null, [Validators.required]]
      });
    } else if (this.jenis.kode == 'kategori') {
      this.tambahForm = this._formBuilder.group({
        kode: [null, [Validators.required]],
        nama: [null, [Validators.required]]
      })
    } else {
      return // TODO: add toast
    }

    modal.present();
  }
  dismissTambah() {
    this.aksiId = null;
    this.isFpLoading = false
    this._unsubscribeForm.next();
    this._unsubscribeForm.complete();
    this.masterId = null;
    // if (this.wilayahSub && !this.wilayahSub.closed) {
    //   this.wilayahSub.unsubscribe();
    // }
  }

  bukaPilihan(modal, title, fcn, fcnNama, url?) {
    this.isPilihanLoading = true;
    this.ambilMaster(url || fcn, {
      ...fcn == 'fungsi' ? { organisasi: this.tambahForm.get('organisasi').value } : {},
    }, 'pilihan', false)

    this.pilihanFcn = fcn;
    this.pilihanFcnNama = fcnNama;
    this.pilihanTitle = title;
    modal.present();
  }
  dismissPilihan() {
    this.pilihan = [];
    this.pilihanFcn = null;
    this.pilihanFcnNama = null;
    this.pilihanTitle = null;
    this.terpilih = null;
  }
  pilihPilihan(modal) {
    if (!this.terpilih) return;
    if (this.tambahForm.get(this.pilihanFcn).value == this.terpilih._id) return modal.dismiss()

    this.tambahForm.get(this.pilihanFcn).setValue(this.terpilih._id)
    this.tambahForm.get(this.pilihanFcnNama).setValue(this.terpilih.nama)

    if (this.pilihanFcn == 'atasan' || this.pilihanFcn == 'penyetuju') {
      this.tambahForm.get(this.pilihanFcnNama).setValue(this.terpilih)
    }

    modal.dismiss();
  }

  hapusForm(scm = []) {
    if (scm.length > 0) {
      scm.forEach(v => {
        this.tambahForm.get(v).setValue(null);
      })
    }
  }

  async ubahMaster(modal, ubahModal, _id) {
    this.masterId = _id;
    if(modal) await modal.dismiss();
    this.bukaTambah(ubahModal, this.masterId)
  }
  async hapusMaster(modal, _id) {
    if (!_id) return;
    let alert = await this._alert.create({
      message: 'Apakah anda ingin menghapus data ' + this.jenis.nama + ' ini?',
      mode: 'ios',
      buttons: [{ text: 'Batal', role: 'cancel' }, { text: 'Hapus', role: 'ok' }]
    })
    await alert.present();
    let { role } = await alert.onDidDismiss();
    if (role != 'ok') return;
    let loading = await this._loading.create({
      message: 'Menghapus ' + this.jenis.nama,
      mode: 'ios'
    })
    loading.present();

    this._master.hapus(this.jenis.kode, _id)
      .subscribe(res => {
        console.log(res)
        loading.dismiss();
        this.ambilMaster();
        modal.dismiss();
      }, async err => {
        loading.dismiss();
        console.log(err);
        // modal.dismiss();
        // TODO: add toast
      })
  }

  simpanTambah(modal) {
    // TODO: pada fungsi cek jenis apakah wilayah kerja atau zona, kalau wilayah atau zona belum diisi beri error
    if (this.tambahForm.invalid) return;
    this.isTambahLoading = true;
    if (this.masterId) {
      this._master.ubah(this.jenis.kode, { _id: this.masterId, ...this.tambahForm.value })
        .subscribe(res => {
          console.log(res)
          this.isTambahLoading = false;
          modal.dismiss();
          this.ambilMaster(this.jenis.kode, null, 'master', false);
        }, async err => {
          console.log(err)
          this.isTambahLoading = false;
          // TODO: add toast

          // if(err.error?.field) this.tambahForm.get(err.error.field).setErrors({ [err.error.type]: true })
        })
    } else {
      this._master.tambah(this.jenis.kode, this.tambahForm.value)
        .subscribe(res => {
          console.log(res)
          this.isTambahLoading = false;
          modal.dismiss();
          this.ambilMaster();
        }, async err => {
          console.log(err)
          this.isTambahLoading = false;

          // TODO: add toast

          // if(err.error?.field) this.tambahForm.get(err.error.field).setErrors({ [err.error.type]: true })
        })
    }
  }
}
