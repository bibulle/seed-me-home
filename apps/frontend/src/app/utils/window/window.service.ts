import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  constructor() {}

  static createWindow(url: string, name = 'Window', width = 500, height = 600) {
    if (url == null) {
      return null;
    }

    const left = screen.width / 2 - width / 2;
    const top = screen.height / 2 - height / 2;

    const options = `width=${width},height=${height},left=${left},top=${top}`;

    return window.open(url, name, options);
  }
}
