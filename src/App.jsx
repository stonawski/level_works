import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateLeft, faRotateRight } from "@fortawesome/free-solid-svg-icons";

function App() {
  // Generate an initial grid 50x50 with null values
  const gridSize = 50;
  const initialGrid = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));

  const [grid, setGrid] = useState(initialGrid);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [cellsToReset, setCellsToReset] = useState([]);
  const [resetHighlight, setResetHighlight] = useState([]);
  const [resetingCells, setResetingCells] = useState(false);
  const [history, setHistory] = useState([initialGrid]);
  const [currentStep, setCurrentStep] = useState(0);
  const [redoStack, setRedoStack] = useState([]);

  // Function for creating seq for every row and column
  const generateSequencesForCheck = useCallback(() => {
    const clearedCells = [];

    // Check each row (both left to right and right to left)
    for (let row = 0; row < gridSize; row++) {
      const rowSequence = grid[row];
      const reverseRowSequence = [...rowSequence].reverse();

      // Check for Fibonacci sequence in the row (left to right)
      const rowFoundIndex = sequenceCheck(rowSequence);
      if (rowFoundIndex !== false) {
        for (let c = rowFoundIndex; c < rowFoundIndex + 5; c++) {
          clearedCells.push([row, c]);
        }
      }

      // Check for Fibonacci sequence in the row (right to left)
      const reverseRowFoundIndex = sequenceCheck(reverseRowSequence);
      if (reverseRowFoundIndex !== false) {
        for (
          let c = gridSize - 1 - reverseRowFoundIndex;
          c > gridSize - 6 - reverseRowFoundIndex;
          c--
        ) {
          clearedCells.push([row, c]);
        }
      }
    }

    // Check each column (both top to bottom and bottom to top)
    for (let col = 0; col < gridSize; col++) {
      const colSequence = grid.map((r) => r[col]); // Get the entire column
      const reverseColSequence = [...colSequence].reverse();

      // Check for Fibonacci sequence in the column (top to bottom)
      const colFoundIndex = sequenceCheck(colSequence);
      if (colFoundIndex !== false) {
        for (let r = colFoundIndex; r < colFoundIndex + 5; r++) {
          clearedCells.push([r, col]);
        }
      }

      // Check for Fibonacci sequence in the column (bottom to top)
      const reverseColFoundIndex = sequenceCheck(reverseColSequence);
      if (reverseColFoundIndex !== false) {
        for (
          let r = gridSize - 1 - reverseColFoundIndex;
          r > gridSize - 6 - reverseColFoundIndex;
          r--
        ) {
          clearedCells.push([r, col]);
        }
      }
    }

    setCellsToReset(clearedCells);
  }, [grid]);

  // Check for fibonacci sequence in order after every grid change
  useEffect(() => {
    generateSequencesForCheck();
  }, [generateSequencesForCheck]);

  useEffect(() => {
    // Highlight and clear the cellsToReset briefly
    if (cellsToReset.length > 0) {
      setResetHighlight(cellsToReset);
      setResetingCells(true);

      setTimeout(() => {
        // Use functional form of setGrid to ensure it works with the most recent grid state
        setGrid((prevGrid) =>
          prevGrid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              return cellsToReset.some(
                ([r, c]) => r === rowIndex && c === colIndex
              )
                ? null
                : cell;
            })
          )
        );

        // Clear the reset state after the timeout completes
        setCellsToReset([]);
        setResetHighlight([]);
        setResetingCells(false);
      }, 1500);
    }
  }, [cellsToReset]);

  // Update the grid and store it in history for undo/redo functionality
  const updateGrid = (newGrid) => {
    const newHistory = history.slice(0, currentStep + 1); // Discard redo history when new action is performed
    setHistory([...newHistory, newGrid]);
    setCurrentStep(newHistory.length);
    setGrid(newGrid);
    setRedoStack([]);
  };

  // Function for handling cell click, updating cell values and grid itself
  const handleCellClick = (rowIndex, colIndex) => {
    if (!resetingCells) {
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

      updateGrid(newGrid);
      setHighlightedCells(updatedCells);

      setTimeout(() => {
        setHighlightedCells([]);
      }, 300);
    }
  };

  // Undo action: Revert to the previous grid state
  const handleUndo = () => {
    if (currentStep > 0) {
      const prevGrid = history[currentStep - 1];
      setGrid(prevGrid);
      setRedoStack([history[currentStep], ...redoStack]);
      setCurrentStep(currentStep - 1);
    }
  };

  // Redo action: Move forward in the history if possible
  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextGrid = redoStack[0];
      setGrid(nextGrid);
      setHistory([...history.slice(0, currentStep + 1), nextGrid]);
      setCurrentStep(currentStep + 1);
      setRedoStack(redoStack.slice(1));
    }
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
          return i;
        }
      }
    }

    return false;
  };

  // Function to determine whether to highlight certain cell
  const isCellHighlighted = (row, col) => {
    return (
      highlightedCells.some(([r, c]) => r === row && c === col) ||
      resetHighlight.some(([r, c]) => r === row && c === col)
    );
  };

  // Function for reseting the grid to default values
  const handleResetButton = () => {
    const nullGrid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null));

    setGrid(nullGrid);
    setHistory([initialGrid]);
    setRedoStack([]);
    setCurrentStep(0);
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
      <div className="button-container">
        <button
          className="history-button left"
          onClick={handleUndo}
          disabled={currentStep === 0 || resetingCells}
        >
          <FontAwesomeIcon icon={faRotateLeft} />
        </button>
        <button className="button" onClick={() => handleResetButton()}>
          Reset Grid
        </button>
        <button
          className="history-button right"
          onClick={handleRedo}
          disabled={redoStack.length === 0 || resetingCells}
        >
          <FontAwesomeIcon icon={faRotateRight} />
        </button>
      </div>
    </div>
  );
}

export default App;
