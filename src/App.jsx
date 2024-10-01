import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const gridSize = 50;
  const initialGrid = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));

  const [grid, setGrid] = useState(initialGrid);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [cellsToReset, setCellsToReset] = useState([]);
  const [lastClickedCell, setLastClickedCell] = useState(null);
  const [resetHighlight, setResetHighlight] = useState([]);
  const [resetingCells, setResetingCells] = useState(false);

  useEffect(() => {
    if (lastClickedCell) {
      const [row, col] = lastClickedCell;
      generateSequencesForCheck(row, col);
    }
  }, [grid]);

  useEffect(() => {
    // Highlight and clear the cellsToReset briefly
    if (cellsToReset.length > 0) {
      setResetHighlight(cellsToReset);
      setResetingCells(true);

      // Clear cells after highlighting
      setTimeout(() => {
        const newGrid = grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            // Clear the cell if it is in cellsToReset
            return cellsToReset.some(
              ([r, c]) => r === rowIndex && c === colIndex
            )
              ? null
              : cell;
          })
        );
        setGrid(newGrid);
        setCellsToReset([]);
        setResetHighlight([]);
        setResetingCells(false);
      }, 1500);
    }
  }, [cellsToReset]);

  const handleCellClick = (rowIndex, colIndex) => {
    if (!resetingCells) {
      console.log("Row: " + rowIndex + "; Col: " + colIndex);
      const updatedCells = [];

      const newGrid = grid.map((row, i) =>
        row.map((cellValue, j) => {
          if (i === rowIndex || j === colIndex) {
            updatedCells.push([i, j]);
            return cellValue === null ? 1 : cellValue + 1;
          }
          return cellValue;
        })
      );
      setGrid(newGrid);
      setHighlightedCells(updatedCells);
      setLastClickedCell([rowIndex, colIndex]);

      setTimeout(() => {
        setHighlightedCells([]);
      }, 300);
    }
  };

  const generateSequencesForCheck = (row, col) => {
    const clearedCells = [];

    const rowSequence = grid[row];
    const rowFoundIndex = sequenceCheck(rowSequence);

    if (rowFoundIndex !== false) {
      // If Fibonacci sequence is found, clear those cells in the row
      for (let c = rowFoundIndex; c < rowFoundIndex + 5; c++) {
        clearedCells.push([row, c]);
      }
    }

    // Check the entire column for Fibonacci sequences
    const colSequence = grid.map((r) => r[col]); // Get the entire column
    const colFoundIndex = sequenceCheck(colSequence);

    if (colFoundIndex !== false) {
      // If Fibonacci sequence is found, clear those cells in the column
      for (let r = colFoundIndex; r < colFoundIndex + 5; r++) {
        clearedCells.push([r, col]);
      }
    }

    // Generate column sequences for selected row
    const startRow = Math.max(row - 4, 0);
    const endRow = Math.min(row + 4, gridSize - 1);

    for (let i = 0; i < gridSize; i++) {
      const verticalSequence = [];
      for (let r = startRow; r <= endRow; r++) {
        verticalSequence.push(grid[r][i]);
      }

      const foundIndex = sequenceCheck(verticalSequence); // Get the starting index of the found subsequence

      if (foundIndex !== false) {
        // Check if a valid index was found
        for (
          let r = startRow + foundIndex;
          r < startRow + foundIndex + 5;
          r++
        ) {
          clearedCells.push([r, i]);
        }
      }
    }

    // Generate row sequences for selected column
    const startCol = Math.max(col - 4, 0);
    const endCol = Math.min(col + 4, gridSize - 1);

    for (let i = 0; i < gridSize; i++) {
      const horizontalSequence = [];
      for (let c = startCol; c <= endCol; c++) {
        horizontalSequence.push(grid[i][c]);
      }

      const foundIndex = sequenceCheck(horizontalSequence); // Get the starting index of the found subsequence
      if (foundIndex !== false) {
        // Check if a valid index was found
        for (
          let c = startCol + foundIndex;
          c < startCol + foundIndex + 5;
          c++
        ) {
          clearedCells.push([i, c]);
        }
      }
    }

    console.log(clearedCells); // Log cleared cells
    setCellsToReset(clearedCells);
  };

  // Checks if sequence contains some subsequence of Fibonacci numbers
  const sequenceCheck = (sequence) => {
    const fib = [1, 1];
    const maxValueInSequence = Math.max(...sequence);

    // Generate Fibonacci numbers up to the max value in the sequence
    while (fib[fib.length - 1] <= maxValueInSequence) {
      fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
    }

    // Check for 5 consecutive Fibonacci numbers in the sequence
    for (let i = 0; i <= sequence.length - 5; i++) {
      const subsequence = sequence.slice(i, i + 5);

      // Try to match this subsequence to the Fibonacci numbers
      for (let j = 0; j <= fib.length - 5; j++) {
        const fibSubsequence = fib.slice(j, j + 5);

        if (subsequence.every((val, idx) => val === fibSubsequence[idx])) {
          return i; // Return the starting index of the found valid Fibonacci subsequence
        }
      }
    }

    return false; // No Fibonacci subsequence found
  };

  // Function to determine whether to highlight certain cell
  const isCellHighlighted = (row, col) => {
    return (
      highlightedCells.some(([r, c]) => r === row && c === col) ||
      resetHighlight.some(([r, c]) => r === row && c === col)
    );
  };

  return (
    <div className="container">
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cellValue, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${
                  isCellHighlighted(rowIndex, colIndex)
                    ? resetHighlight.some(
                        ([r, c]) => r === rowIndex && c === colIndex
                      )
                      ? "reset-highlight"
                      : "highlight"
                    : ""
                }`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cellValue !== null ? cellValue : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
