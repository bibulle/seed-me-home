export interface FileMove {
  sourcePath: string;
  targetPath: string;
  targetType: MoveType;
}

export enum MoveType {
  movies,
  series
}
