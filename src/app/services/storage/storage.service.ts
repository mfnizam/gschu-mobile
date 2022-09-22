import { Injectable } from '@angular/core';
import { Preferences  } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  set = async (key, value) => {
    await Preferences .set({ key, value: JSON.stringify(value) });
  };

  get = async (key) => {
    const { value } = await Preferences .get({ key });
    return JSON.parse(value);
  };

  remove = async (key) => {
    await Preferences .remove({ key });
  };
}
