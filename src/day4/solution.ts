import { chunk, intersection, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function solve( input: string, winningIndexChooser: (...nums) => number ) {
    const lines = input.replace( /\n\n/g, '\n' ).split( '\n' );
    const balls: number[] = JSON.parse( '[' + lines.shift() + ']' );
    const boards = chunk( lines, 5 ).map(
        board => board.map(
            line => Array.from( line.matchAll(/\d+/g) ).map( match => Number(match[0]) )
        )
    );

    // find the ball index at which each board gets bingo, and select the board that matches one of those indeces (chosen by winningIndexChooser)
    const winningIndexes = boards.map( board => findWinningIndex(board, balls) );
    const winningIndex = winningIndexChooser( ...winningIndexes );
    const winningBoard = boards[ winningIndexes.indexOf(winningIndex) ];
    const calledNumbers = balls.slice( 0, winningIndex + 1 );
    // multiply (the value of the ball that triggered the selected board to win) * (the sum of all uncalled numbers on the selected board)
    return balls[winningIndex] * sum( winningBoard.flat().filter(num => !calledNumbers.includes(num) ) );
}

/** Returns an array of 5-number arrays that represent the sets of numbers that would trigger a win on the given board */
function getWinningQuintuplets( board: number[][] ) {
    const rotatedBoard = board[0].map( (_, i) => board.map(row => row[i]) );
    return board.concat( rotatedBoard );
}

/** Returns the index of the ball that, when drawn, will cause a win on the given board */
function findWinningIndex( board: number[][], balls: number[] ) {
    const winningQuintuplets = getWinningQuintuplets( board );
    return balls.findIndex(
        (ball, i) => i >= 4 && winningQuintuplets.some(
            quint => intersection( quint, balls.slice(0, i+1) ).length === 5
        )
    );
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => solve( input, Math.min ), // function that solves part 1. Finds the board that gets bingo at the lowest ball index
    ( input: string ) => solve( input, Math.max ) // function that solves part 2. Finds the board that gets bingo at the highest ball index
);
