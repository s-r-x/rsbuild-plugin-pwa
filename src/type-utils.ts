export type SetRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
export type OmitRequired<T, K extends keyof T> = Omit<Required<T>, K> &
  Partial<Pick<Required<T>, K>>;
