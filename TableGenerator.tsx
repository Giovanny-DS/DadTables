import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';

interface TableGeneratorProps {
  numColumns: number;
  numRows: number;
  numTablesPerPage: number;
  numFinalColumns: number;
  horizontalOrientation?: boolean;
  columnStartsWithZero?: boolean;
  rowStartsWithZero?: boolean;
}

interface HighlightInfo {
  [coordinates: string]: HighlightValues;
}
interface HighlightValues {
  color: string;
  isActive: boolean;
  id: string;
}

type HighlightDecision = {
  shouldHighlight: boolean;
  item?: HighlightValues;
  shouldCreateItem?: boolean | HighlightInfo;
  newItemCord?: string;
};

export interface TableGeneratorHandle {
  highlightCell: (coordinates: string, color: string) => void;
  resetHighlights: () => void;
  undoLastHighlight: () => void;
}

const TableGenerator = React.forwardRef<
  TableGeneratorHandle,
  TableGeneratorProps
>(
  (
    {
      numColumns,
      numRows,
      numTablesPerPage,
      numFinalColumns,
      horizontalOrientation = false,
      columnStartsWithZero = false,
      rowStartsWithZero = false,
    },
    ref
  ) => {
    const [pages, setPages] = React.useState<JSX.Element[][]>([]);
    const [highlights, setHighlights] = React.useState<HighlightInfo>({});
    const [highlightHistory, setHighlightHistory] = React.useState<string[]>(
      []
    );
    let itemsToHighLight: HighlightInfo = {};
    React.useEffect(() => {
      const generatedPages = generateTables();
      setPages(generatedPages);
    }, [highlights]);

    const generateTables = (): JSX.Element[][] => {
      let tablesGenerated = 0;
      let pagesGenerated = [];
      let currentPage;
      let lastColumn = 0;

      while (lastColumn < numFinalColumns) {
        if (tablesGenerated % numTablesPerPage === 0) {
          currentPage = [];
          pagesGenerated.push(currentPage);
        }

        const table = (
          <table key={`table-${tablesGenerated + 1}`} className="tank-table">
            <thead>
              <tr>
                <th>X</th>
                {createColumnHeaders(lastColumn)}
              </tr>
            </thead>
            <tbody>{createRows(lastColumn)}</tbody>
          </table>
        );

        currentPage.push(table);
        tablesGenerated++;
        lastColumn += numColumns;
      }
      console.log({ itemsToHighLight, highlightHistory });
      if (Object.keys(itemsToHighLight).length > 0) {
        setHighlights((prevHighlights) => ({
          ...prevHighlights,
          ...itemsToHighLight,
        }));
      }
      return pagesGenerated;
    };

    const createColumnHeaders = (lastColumn: number): JSX.Element[] => {
      let columnStart = rowStartsWithZero ? 0 : 1;
      let columnEnd = rowStartsWithZero
        ? Number(numColumns)
        : Number(numColumns + 1);

      return Array.from({ length: columnEnd - columnStart }, (_, i) => (
        <th key={`header-${i}`}>{columnStart + i + lastColumn}</th>
      ));
    };

    const createRows = (lastColumn: number): JSX.Element[] => {
      let rowStart = columnStartsWithZero ? 0 : 1;
      let rowEnd = columnStartsWithZero ? Number(numRows) : Number(numRows + 1);

      return Array.from({ length: rowEnd - rowStart }, (_, rowIndex) => (
        <tr key={`row-${rowIndex}`}>
          <th>{rowStart + rowIndex}</th>
          {createColumns(rowStart + rowIndex, lastColumn)}
        </tr>
      ));
    };

    const createColumns = (
      rowIndex: number,
      lastColumn: number
    ): JSX.Element[] => {
      const columns: JSX.Element[] = [];

      const columnStart = rowStartsWithZero ? 0 : 1;
      const columnEnd = rowStartsWithZero ? numColumns : numColumns + 1;
      for (let i = columnStart; i < columnEnd; i++) {
        const coordinates = `${i + lastColumn}.${rowIndex}`;
        const highlighInfo = getCellHighLightInfo(coordinates);
        columns.push(
          <td
            key={coordinates}
            data-coordinates={coordinates}
            style={highlighInfo}
          >
            {coordinates} {highlights[coordinates]?.isActive}
          </td>
        );
      }

      return columns;
    };

    const getCellHighLightInfo = (
      coordinates: string
    ): React.CSSProperties | undefined => {
      let field = shouldHighlight(coordinates);
      if (field.shouldHighlight) {
        const color = field.item.color;
        return { backgroundColor: color };
      }
      return undefined;
    };

    const shouldHighlight = (coordinates: string): HighlightDecision => {
      const currentCoord = Number(coordinates);
      for (const key in highlights) {
        const targetCoord = Number(key);
        if (currentCoord === targetCoord)
          return {
            shouldHighlight: true,
            item: highlights[key],
            shouldCreateItem: false,
          };
        if (currentCoord < targetCoord) {
          let item: boolean | HighlightInfo = false;
          if (!highlights[coordinates]?.color) {
            itemsToHighLight = {
              ...itemsToHighLight,
              [coordinates]: {
                color: highlights[key].color,
                isActive: false,
                id: highlights[key].id,
              },
            };
          }
          return {
            shouldHighlight: true,
            item: highlights[key],
            shouldCreateItem: item,
          };
        }
      }
      return { shouldHighlight: false, shouldCreateItem: false };
    };

    React.useImperativeHandle(ref, () => ({
      highlightCell: (coordinates: string, color: string) => {
        const id = uuidv4();
        setHighlightHistory((prevHistory) => [...prevHistory, id]);
        setHighlights((prevHighlights) => ({
          ...prevHighlights,
          [coordinates]: { color: color, isActive: true, id },
        }));
      },
      resetHighlights: () => {
        setHighlights({});
        setHighlightHistory([]);
      },
      undoLastHighlight: () => {
        if (highlightHistory.length > 0) {
          const lastId = highlightHistory[highlightHistory.length - 1];
          let updatedHighlights = Object.keys(highlights).reduce(
            (acc, curr) => {
              if (highlights[curr].id === lastId) {
                console.log({ acc, curr });
                return acc;
              }
              acc = { ...acc, [curr]: highlights[curr] };
              console.log({ acc });
              return acc;
            },
            {}
          );
          console.log({ updatedHighlights });
          setHighlights((prevHighlights) => updatedHighlights);
          setHighlightHistory((prevHistory) => prevHistory.slice(0, -1));
        }
      },
    }));

    return (
      <div
        className={`table-container ${
          horizontalOrientation ? 'horizontal' : 'vertical'
        }`}
      >
        {pages.map((page, index) => (
          <div key={`page-${index}`} className="page">
            {page}
          </div>
        ))}
      </div>
    );
  }
);

export default TableGenerator;
