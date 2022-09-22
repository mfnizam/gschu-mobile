import { Injectable } from '@angular/core';
import { Fungsi, Jabatan, Wilayah } from 'app/pages/public/master/master.types';
import { Observable, BehaviorSubject } from 'rxjs';

export class User {
  _id           : string;
	namaLengkap		: string;
  inisial      ?: string;
  email 				: string;
	kodeNoTlp 		: string;
	noTlp 				: string;
	noPegawai			: number;
	wilayah     	: Wilayah;
	fungsi  			: Fungsi;
	jabatan 			: Jabatan;
	foto         ?: string;
  tokenNotif   ?: string[];
  admin        ?: boolean;
  atasan       ?: boolean;
  penyetuju    ?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _user: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  set user(value: User) { this._user.next(value); }
  get user$(): Observable<User>{ return this._user.asObservable(); }
  get user(): User { return this._user.getValue() }

  constructor() { }
}
