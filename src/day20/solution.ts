import { cloneDeep, range } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function parseInput( input: string, numEnhancements: number ) {
    const parts = input.split( '\n\n' );
    const enhancementAlgo = parts[0].replaceAll( /\./g, '0' ).replaceAll( /#/g, '1' );
    let yxGrid = parts[1].split( '\n' ).map( r => r.split('').map( c => '.#'.indexOf(c).toString() ) );

    range( numEnhancements ).forEach( i => {
        yxGrid = enhance( yxGrid, enhancementAlgo, i === 0 ? '0' : yxGrid[0][0] );
    });

    return yxGrid.flat().filter( c => c === '1' ).length;

}

function enhance( grid: string[][], algo: string, extendChar ) {
    // add extra space around the edges of the grid
    const blankRow = () => new Array( grid[0].length ).fill( extendChar );
    grid.unshift( blankRow(), blankRow() );
    grid.push( blankRow(), blankRow() );
    for ( let y = 0; y < grid.length; y++ ) {
        grid[y].push( extendChar, extendChar );
        grid[y].unshift( extendChar, extendChar );
    }

    // for every group of 3x3, replace the center pixel with the enhanced version
    const newGrid = cloneDeep( grid );
    for ( let y = 1; y < grid.length - 1; y++ ) {
        for ( let x = 1; x < grid[y].length - 1; x++ ) {
            const binaryString = [ -1, 0, 1 ].reduce( (total, diff) => {
                return total + grid[y + diff].slice( x - 1, x + 2 ).join( '' );
            }, '' );
            newGrid[y][x] = algo[ parseInt(binaryString, 2) ];
        }
    }

    // If the edge characters are all 0's, they all get replaced with the 0th character in the algorithm.
    // If the edge characters are all 1's, they all get replaced with the last character in the algorithm.
    // ...because the image is "infinitely large"
    const edgeChar = newGrid[0][0] === '0' ? algo[0] :algo[ algo.length - 1 ];
    [ 0, newGrid.length - 1 ].forEach( i => newGrid[i] = new Array(newGrid[i].length).fill(edgeChar) );
    for ( let y = 1; y < newGrid.length - 1; y++ ) {
        newGrid[y][0] = edgeChar;
        newGrid[y][ newGrid[y].length - 1 ] = edgeChar;
    }

    return newGrid;
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => parseInput( input, 2 ),
    // function that solves part 2
    ( input: string ) => parseInput( input, 50 )
);
