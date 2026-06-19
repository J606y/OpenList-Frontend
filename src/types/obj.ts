export enum ObjType {
  UNKNOWN,
  FOLDER,
  // OFFICE,
  VIDEO,
  AUDIO,
  TEXT,
  IMAGE,
}

export interface Obj {
  name: string
  size: number
  is_dir: boolean
  created: string
  modified: string
  sign?: string
  thumb: string
  type: ObjType
  duration?: number
  mount_details?: MountDetails
}

export type StoreObj = Obj & {
  selected?: boolean
}

export type ArchiveObj = Obj & {
  inner_path?: string
  archive?: Obj
  pass?: string
}

export type RenameObj = {
  src_name: string
  new_name: string
}

export type MountDetails = {
  total_space?: number
  free_space?: number
  used_space?: number
  driver_name: string
}
