export interface UserBase {
  idUser?: number
  name: string
}

export interface UserCreate extends UserBase {
  mail: string
  pwd: string
}
