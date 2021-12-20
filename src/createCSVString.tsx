import { records } from "@i2analyze/notebook-sdk";
import { IListItemHeading, IListItemRow } from "./ProcessSelection";

export function createCSVStringForRecords(
  recordIds: Set<records.AnalyzeRecordId> | "all",
  headings: IListItemHeading[],
  rows: IListItemRow[]
): string {
  let value = "";

  for (const heading of headings) {
    value = value + JSON.stringify(heading.header) + "\t";
  }

  value = value + "\n";

  for (const row of rows) {
    if (recordIds === "all" || recordIds.has(row.id)) {
      for (const heading of headings) {
        if (row.hasOwnProperty(heading.key)) {
          const rowValue = row[heading.key];

          value =
            value +
            JSON.stringify(
              typeof rowValue === "string" ? rowValue : rowValue.sortValue
            ) +
            "\t";
        }
      }

      value = value + "\n";
    }
  }

  return value;
}
