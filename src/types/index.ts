export * from "./User.types"
export * from "./Page.types"
export * from "./Site.types"
export * from "./Image.types"
export * from "./Pagination.types"
export * from "./Template.types"
export * from "./Upload.types"



export interface Option {
  value: string;
  label: string;
}
export type Options = Option[]

export interface ActionButton {
    ariaLabel: string;
    icon: string;
    rounded: boolean;
    severity: string;
    click: (...args: any[]) => void;
}