import { ContentSwitcher, Switch } from "carbon-components-react";
import BaseTable, { Column, ColumnShape, SortOrder } from "react-base-table";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import "./ListItems.scss";

import { useToolViewApi } from "./useToolViewApi";
import { FilterItemTypeId, ListItemsMode } from "./Types";
import {
  IListItemHeading,
  IListItemRow,
  processChartSelection,
} from "./ProcessSelection";
import { records, schema } from "@i2analyze/notebook-sdk";
import { createCSVStringForRecords } from "./createCSVString";

interface IListItemsState {
  filterItemTypeId: FilterItemTypeId;
  mode: ListItemsMode;
  sortedListItemsHeading?: IListItemHeading;
}

interface IModeAction {
  type: "mode";
  payload: ListItemsMode;
}

interface ISortAction {
  type: "sort";
  payload: IListItemHeading;
}

interface IFilterItemTypeAction {
  type: "filter-item-type";
  payload: FilterItemTypeId;
}

type IAction = IModeAction | ISortAction | IFilterItemTypeAction;

function listItemReducer(
  state: IListItemsState,
  action: IAction
): IListItemsState {
  switch (action.type) {
    case "mode":
      return { ...state, mode: action.payload, filterItemTypeId: "all" };
    case "sort":
      return { ...state, sortedListItemsHeading: action.payload };
    case "filter-item-type":
      return { ...state, filterItemTypeId: action.payload };
    default:
      return state;
  }
}

export function ListItems() {
  const toolViewApi = useToolViewApi();
  const [recordCount, setRecordCount] = useState(0);

  const [state, dispatch] = useReducer(listItemReducer, {
    filterItemTypeId: "all",
    mode: "entity",
  } as IListItemsState);

  const [sortBy, setSortBy] = useState<
    { key: React.Key; order: SortOrder } | undefined
  >(undefined);

  const [tableRows, setRows] = useState<IListItemRow[]>([]);
  const [headings, setHeadings] = useState<IListItemHeading[]>([]);

  const [itemTypes, setItemTypes] = useState<
    { id: schema.ChartItemTypeId; label: string }[]
  >([]);

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setTableDimensions] = useState({ width: 0, height: 0 });

  const [selectState, setSelectionState] = useState<SelectionStateValue>(
    new Set()
  );

  useEffect(() => {
    return toolViewApi.addEventListener(
      "chartselectionchange",
      (selection, application) => {
        const { rows, headings, itemTypes } = processChartSelection(
          state.mode,
          state.filterItemTypeId,
          selection,
          toolViewApi.formatter,
          application.chart.schema
        );

        setRows(rows);
        setHeadings(headings);
        setRecordCount(selection.records.size);

        if (state.filterItemTypeId === "all") {
          setItemTypes(itemTypes);
        }
      },
      { dispatchNow: true }
    );
  }, [toolViewApi, state]);

  useLayoutEffect(() => {
    const measureTable = () => {
      const tableContainer = tableContainerRef.current;
      const { width, height } = tableContainer!.getBoundingClientRect();

      setTableDimensions({ width, height });
    };

    window.addEventListener("resize", measureTable);

    measureTable();

    return () => window.removeEventListener("resize", measureTable);
  }, []);

  const areAllRowsSelected = selectState === "all";

  const copySelectedItemsToClipboard = () => {
    navigator.clipboard.writeText(
      createCSVStringForRecords(selectState, headings, tableRows)
    );
  };

  return (
    <SelectionStateContext.Provider
      value={{ state: selectState, setState: setSelectionState }}
    >
      <div className="list-items--container">
        <div className="list-items--header">
          Records: {toolViewApi.formatter.formatValue(recordCount)}
          <br />
          Viewing: {toolViewApi.formatter.formatValue(tableRows.length)}
          <ContentSwitcher
            onChange={({ name }) =>
              dispatch({ type: "mode", payload: name as ListItemsMode })
            }
          >
            <Switch name="entity" text="Entities" />
            <Switch name="link" text="Links" />
          </ContentSwitcher>
          <ContentSwitcher
            onChange={({ name }) =>
              dispatch({
                type: "filter-item-type",
                payload: name as FilterItemTypeId,
              })
            }
          >
            <Switch name="all" text="All" />
            {itemTypes.map(({ id, label }) => (
              <Switch name={id} text={label} key={id} />
            ))}
          </ContentSwitcher>
          <button
            disabled={!areAllRowsSelected && selectState.size === 0}
            onClick={copySelectedItemsToClipboard}
          >
            Copy Selected items to clipboard
          </button>
        </div>

        <div className="list-items--table-container" ref={tableContainerRef}>
          <BaseTable
            data={tableRows}
            width={dimensions.width}
            height={dimensions.height}
            className="list-items--table"
            emptyRenderer={
              <EmptyRenderer
                hasRecordsSelected={!!recordCount}
                reset={() => dispatch({ type: "mode", payload: "entity" })}
              />
            }
            onColumnSort={({ key, order }) => {
              const data = tableRows;

              function getSortValue(row: IListItemRow): string {
                const value = row[key];
                return typeof value === "string" ? value : value.sortValue;
              }

              data.sort((r1, r2) => {
                const r1SortValue = getSortValue(r1);
                const r2SortValue = getSortValue(r2);
                return order === "asc"
                  ? r1SortValue.localeCompare(r2SortValue)
                  : r2SortValue.localeCompare(r1SortValue);
              });

              setRows(data);
              setSortBy({ key, order });
            }}
            sortBy={sortBy}
          >
            <Column
              headerRenderer={
                <input
                  type="checkbox"
                  checked={areAllRowsSelected}
                  onChange={(e) =>
                    setSelectionState(e.target.checked ? "all" : new Set())
                  }
                />
              }
              dataKey="selection"
              key="selection"
              title=""
              cellRenderer={({ rowData }: { rowData: IListItemRow }) => (
                <SelectionCell rowData={rowData} />
              )}
              flexGrow={0}
              flexShrink={0}
              width={50}
            />
            {headings.map(
              (heading, index) =>
                index < 7 ? (
                  <Column
                    headerRenderer={() => <div> {heading.header} </div>}
                    key={heading.key}
                    dataKey={heading.key}
                    title={heading.header}
                    dataGetter={({
                      rowData,
                      column,
                    }: {
                      rowData: IListItemRow;
                      column: ColumnShape;
                    }) => {
                      const cell = rowData[column.dataKey!];

                      if (!cell) {
                        return "";
                      }

                      return typeof cell === "string" ? cell : cell.node;
                    }}
                    sortable
                    flexGrow={1}
                    flexShrink={1}
                    width={100}
                  />
                ) : null // Limit the number of columns to 6
            )}
          </BaseTable>
        </div>
      </div>
    </SelectionStateContext.Provider>
  );
}

interface IEmptyRenderProps {
  readonly hasRecordsSelected: boolean;
  reset(): void;
}

function EmptyRenderer({ hasRecordsSelected, reset }: IEmptyRenderProps) {
  return (
    <div className="list-items--empty-table">
      {hasRecordsSelected ? (
        <>
          Your current filters match nothing selected on the chart{" "}
          <button onClick={reset}>Reset filters</button>
        </>
      ) : (
        <>Select items on the chart to see them listed here</>
      )}
    </div>
  );
}

type SelectionStateValue = Set<records.AnalyzeRecordId> | "all";

interface ISelectionStateContextValue {
  state: SelectionStateValue;
  setState(
    setterOrValue:
      | ((state: SelectionStateValue) => SelectionStateValue)
      | SelectionStateValue
  ): void;
}

const SelectionStateContext = createContext<ISelectionStateContextValue>({
  state: new Set(),
  setState() {},
});

function SelectionCell({ rowData }: { rowData: IListItemRow }) {
  const { state, setState } = useContext(SelectionStateContext);

  const areAllRowsSelected = state === "all";
  return (
    <input
      type="checkbox"
      disabled={areAllRowsSelected}
      checked={areAllRowsSelected || state.has(rowData.id)}
      onChange={(e) =>
        setState((s: SelectionStateValue) => {
          if (s === "all") {
            return s;
          }
          if (e.target.checked) {
            s.add(rowData.id);
          } else {
            s.delete(rowData.id);
          }
          return new Set(s);
        })
      }
    />
  );
}
