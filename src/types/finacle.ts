export type MenuCategoryId =
  | 'cif-signature'
  | 'sb'
  | 'td'
  | 'mis'
  | 'scss'
  | 'rd'
  | 'loan-rd'
  | 'ppf'
  | 'loan-ppf'
  | 'nsc-kvp'
  | 'office-cash'
  | 'interest'
  | 'charges'
  | 'cheque-inventory'
  | 'cheque-clearing'
  | 'customer-inquiry'
  | 'deposits-reports'
  | 'other-reports'
  | 'day-end';

export type ActionType =
  | 'Open'
  | 'Verify'
  | 'Modify'
  | 'Close'
  | 'Transaction'
  | 'Inquiry'
  | 'Report'
  | 'Inventory'
  | 'Maintenance';

export type RoleScope =
  | 'Counter PA'
  | 'Supervisor'
  | 'Counter PA & Supervisor'
  | 'Auditor / Inquiry';

export interface MenuCategoryMeta {
  id: MenuCategoryId;
  label: string;
  shortLabel: string;
  group: 'Customer & Core' | 'Deposit Schemes' | 'Loans' | 'Operations & Clearing' | 'Reports & Audit';
}

export interface FinacleMenuItem {
  code: string;
  title: string;
  description: string;
  categories: MenuCategoryId[];
  primaryCategory: MenuCategoryId;
  actionType: ActionType;
  role: RoleScope;
  isAuditorMenu: boolean;
  pdfPages: number[];
  keywords: string[];
  notes?: string[];
  steps?: string[];
  relatedCodes?: string[];
  multiContextUses?: { context: string; detail: string }[];
}

export interface SchemeLifecycleRow {
  scheme: string;
  code: string;
  open: string;
  modBeforeVerify: string;
  verifyOpen: string;
  modAfterVerify: string;
  transaction: string;
  close: string;
  verifyClose: string;
  special: { code: string; label: string }[];
}

export interface ProcedureWorkflow {
  id: string;
  title: string;
  category: string;
  summary: string;
  codes: string[];
  role: RoleScope;
  pdfPage: number;
  caution?: string;
  steps: {
    stepNumber: number;
    menuCode?: string;
    instruction: string;
    detail?: string;
  }[];
}
