import * as React from 'react';
import './style.css';
import TextField from '@mui/material/TextField';
import TableGenerator, { TableGeneratorHandle } from './TableGenerator';

const App: React.FC = () => {
  const tableGeneratorRef = React.createRef<TableGeneratorHandle>();

  const [coordinates, setCoordinates] = React.useState('');
  const [color, setColor] = React.useState('#000000');

  const handleHighlight = () => {
    if (tableGeneratorRef.current) {
      tableGeneratorRef.current.highlightCell(coordinates, color);
    }
  };

  const handleResetHighlights = () => {
    if (tableGeneratorRef.current) {
      tableGeneratorRef.current.resetHighlights();
    }
  };

  const handleUndoLastHighlight = () => {
    if (tableGeneratorRef.current) {
      tableGeneratorRef.current.undoLastHighlight();
    }
  };

  React.useEffect(() => {
    tableGeneratorRef.current.highlightCell('2.2', 'yellow');
    tableGeneratorRef.current.highlightCell('3.2', 'brown');
    tableGeneratorRef.current.highlightCell('4.2', 'red');
    console.log('exec');
  }, []);
  return (
    <div className="App">
      <form>
        <label>
          Coordinates:
          <TextField id="outlined-basic" label="Outlined" variant="outlined" />
          <TextField id="outlined-basic" label="Outlined" variant="outlined" />
          <input
            type="text"
            value={coordinates}
            onChange={(e) => setCoordinates(e.target.value)}
            placeholder="Example: 5.3"
          />
        </label>
        <label>
          Color:
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
        <button type="button" onClick={handleHighlight}>
          Highlight cells
        </button>
        <button type="button" onClick={handleResetHighlights}>
          Reset highlights
        </button>
        <button type="button" onClick={handleUndoLastHighlight}>
          Undo last highlight
        </button>
      </form>
      <TableGenerator
        ref={tableGeneratorRef}
        numColumns={14}
        numRows={10}
        numTablesPerPage={3}
        numFinalColumns={69}
        horizontalOrientation={false}
        columnStartsWithZero={true}
        rowStartsWithZero={true}
      />
    </div>
  );
};

export default App;
