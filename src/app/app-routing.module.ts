import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { PenandatanganGuard, AuthGuard, NonAuthGuard } from './services/auth/auth.guard';

const routes: Routes = [ 
  /* {
    path: 'form/:kategori',
    loadChildren: () => import('./pages/public/form/form.module').then( m => m.FormPageModule),
    canActivate: [AuthGuard]
  }, */{
    path: 'permintaan',
    loadChildren: () => import('./pages/public/permintaan/permintaan.module').then( m => m.PermintaanPageModule),
    canActivate: [AuthGuard],
  },{
    path: 'persetujuan',
    loadChildren: () => import('./pages/public/persetujuan/persetujuan.module').then( m => m.PersetujuanPageModule),
    canActivate: [AuthGuard],
  },{
    path: 'akun',
    loadChildren: () => import('./pages/public/akun/akun.module').then( m => m.AkunPageModule),
    canActivate: [AuthGuard],
  },{
    path: 'biodata',
    loadChildren: () => import('./pages/public/biodata/biodata.module').then( m => m.BiodataPageModule),
    canActivate: [AuthGuard],
  },{
    path: 'notifikasi',
    loadChildren: () => import('./pages/public/notifikasi/notifikasi.module').then( m => m.NotifikasiPageModule),
    canActivate: [AuthGuard],
  },{
    path: 'notifikasi/:id',
    loadChildren: () => import('./pages/public/notif/notif.module').then( m => m.NotifPageModule),
    canActivate: [AuthGuard],
  },{
    path: 'detail/:jenis/:id',
    loadChildren: () => import('./pages/public/detail/detail.module').then( m => m.DetailPageModule),
    canActivate: [AuthGuard],
  },{
    path: 'ulasan/:id',
    loadChildren: () => import('./pages/public/ulasan/ulasan.module').then( m => m.UlasanPageModule),
    canActivate: [AuthGuard],
  },{
    path: 'pengaturan',
    loadChildren: () => import('./pages/public/pengaturan/pengaturan.module').then( m => m.PengaturanPageModule),
    canActivate: [AuthGuard],
  },/* {
    path: 'master/:jenis',
    loadChildren: () => import('./pages/public/master/master.module').then( m => m.MasterPageModule),
    canActivate: [AuthGuard],
  }, */{
    path: 'master/zona',
    loadChildren: () => import('./pages/public/master/zona/zona.module').then( m => m.ZonaPageModule)
  },{
    path: 'master/wilayah',
    loadChildren: () => import('./pages/public/master/wilayah/wilayah.module').then( m => m.WilayahPageModule)
  },{
    path: 'master/fungsi',
    loadChildren: () => import('./pages/public/master/fungsi/fungsi.module').then( m => m.FungsiPageModule)
  },{
    path: 'master/jabatan',
    loadChildren: () => import('./pages/public/master/jabatan/jabatan.module').then( m => m.JabatanPageModule)
  },{
    path: 'kategori',
    loadChildren: () => import('./pages/public/kategori/kategori.module').then( m => m.KategoriPageModule)
  },{
    path: 'cetak',
    loadChildren: () => import('./pages/public/cetak/cetak.module').then( m => m.CetakPageModule)
  },{
    path: 'pengguna',
    loadChildren: () => import('./pages/public/pengguna/pengguna.module').then( m => m.PenggunaPageModule)
  },{
    path: 'masuk',
    loadChildren: () => import('./pages/auth/masuk/masuk.module').then( m => m.MasukPageModule),
    canActivate: [NonAuthGuard],
  },{
    path: 'daftar',
    loadChildren: () => import('./pages/auth/daftar/daftar.module').then( m => m.DaftarPageModule),
    canActivate: [NonAuthGuard],
  },{
    path: 'sandilupa',
    loadChildren: () => import('./pages/auth/sandilupa/sandilupa.module').then( m => m.SandilupaPageModule)
  },{
    path: 'sandiverifikasi',
    loadChildren: () => import('./pages/auth/sandiverifikasi/sandiverifikasi.module').then( m => m.SandiverifikasiPageModule)
  },{
    path: 'sandibaru',
    loadChildren: () => import('./pages/auth/sandibaru/sandibaru.module').then( m => m.SandibaruPageModule)
  },{
    path: 'sandipemberitahuan',
    loadChildren: () => import('./pages/auth/sandipemberitahuan/sandipemberitahuan.module').then( m => m.SandipemberitahuanPageModule)
  },{
    path: 'privasi',
    loadChildren: () => import('./pages/privasi/privasi.module').then( m => m.PrivasiPageModule)
  },{
    path: '',
    loadChildren: () => import('./pages/public/beranda/beranda.module').then( m => m.BerandaPageModule),
    canActivate: [AuthGuard],
  }, {
    path: '**',
    redirectTo: ''
  }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
