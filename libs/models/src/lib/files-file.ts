export interface FilesFile {
  fullpath: string;
  path: string;
  size: number;
  downloaded: number;
  isDirectory: boolean;
  modifiedDate: Date;
  children: FilesFile[];
}
