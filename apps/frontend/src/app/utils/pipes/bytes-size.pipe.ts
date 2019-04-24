import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bytesSize'
})
export class BytesSizePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const num = Number(value);

    if (isNaN(num)) {
      return value;
    }

    let str = num + ' B';

    if (num > Math.pow(1024, 4)) {
      str = (num / Math.pow(1024, 4)).toFixed(2) + ' TB';
    } else if (num > Math.pow(1024, 3)) {
      str = (num / Math.pow(1024, 3)).toFixed(2) + ' GB';
    } else if (num > Math.pow(1024, 2)) {
      str = (num / Math.pow(1024, 2)).toFixed(2) + ' MB';
    } else if (num > Math.pow(1024, 1)) {
      str = (num / Math.pow(1024, 1)).toFixed(2) + ' KB';
    }

    return str;
  }
}

@NgModule({
  imports: [],
  declarations: [BytesSizePipe],
  providers: [BytesSizePipe],
  exports: [BytesSizePipe]
})
export class BytesSizeModule {}
