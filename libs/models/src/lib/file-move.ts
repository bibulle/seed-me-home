export interface FileMove {
  sourcePath: string;
  sourceFullPath: string;
  targetPath: string;
  targetType: MoveType;
}

export enum MoveType {
  movies,
  series
}
