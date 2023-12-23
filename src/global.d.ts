type FormValue = {
  mocoDomain: string;
  mocoApiKey: string;
  mapToSingleMocaTask: boolean;
  mocaTaskForExport: string;
  startDate: string;
  endDate: string;
  teamMemberID: string;
  taskIDs: string;
  onlyUnbilled: boolean;
  markAsBilled: boolean;
  includeNonBillable: boolean;
  summarizeByDay: boolean;
  descriptionContent: "name" | "note" | "name+note";
};

export enum BillingState {
  Unbilled = 0,
  Billed,
  Paid,
}

export interface TimeEntry {
  billing: string;
  category: string;
  category_id: string;
  distance: number;
  distance_unit: string;
  duration: string;
  duration_unit: "m";
  end: string;
  id: string;
  note: string;
  project: string;
  project_id: string;
  quantity: number;
  rate: number;
  rate_unit: string;
  rounding_method: string;
  rounding_minutes: number;
  start: string;
  subtask: string;
  subtask_id: string;
  sum: number;
  sum_unit: string;
  task: string;
  task_id: string;
  type: string;
  user: string;
  user_id: string;
}

interface Tyme {
  timeEntries(
    start: string,
    end: string,
    taskIDs: string | null,
    limit: number | null,
    billingState: BillingState,
    billable: boolean | null,
    userID: string | null,
  ): TimeEntry[];

  setBillingState(timeEntryIDs: string[], billingState: BillingState): void;

  userIDForEmail(email: string): void;

  showAlert(title: string, message: string): void;

  currencyCode(): string;

  currencySymbol(): string;

  openURL(url: string): void;

  openSaveDialog(fileName: string, content: string): void;

  selectFile(
    title: string,
    fileTypes: string[],
    resultFunction: (fileContents: string[]) => void,
  ): void;

  setSecureValue(key: string, value: string): void;

  getSecureValue(key: string): void;
}

interface Utils {
  removeFile(fileName: string): void;

  fileExists(fileName: string): boolean;

  writeToFile(fileName: string, content): void;

  contentsOfFile(fileName: string): string;

  base64Encode(value: string): string;

  base64Decode(value: string): string;

  localize(value: string): string;

  log(value: string): void;

  markdownToHTML(markdown: string): string;

  request(
    url: string,
    method: string,
    headers: Record<string, string>,
    parameters: Record<string, string>,
  ): UtilRequestResponse;
}

export interface UtilRequestResponse<T = string | null> {
  statusCode: number;
  result: T;
}

declare global {
  const formValue: FormValue;
  const tyme: Tyme;
  const utils: Utils;
  const DRY_RUN_MODE: boolean;
}
