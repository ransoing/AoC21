import { curry, identity } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function parseInput( input: string ) {
    // build a grid of booleans
    const max = regex => Math.max( ...Array.from( input.matchAll( regex ) ).map( m => Number(m[1]) ) );
    const [ cols, rows ] = [ max(/(\d+),/g) + 1, max(/,(\d+)/g) + 1 ];
    const grid = new Array( rows ).fill( 0 ).map( _ => new Array(cols).fill(false) );
    Array.from( input.matchAll(/\d+,\d+/g) ).forEach( m => {
        const [ x, y ] = m[0].split( ',' ).map( Number );
        grid[y][x] = true;
    });
    return {
        grid: grid,
        // convert instructions into a function to call which will fold the grid
        instructions: Array.from( input.matchAll(/(x|y)=(\d+)/g) ).map( m => curry(m[1] === 'x' ? foldX : foldY)(Number(m[2])) )
    };
}

function foldX( x: number, grid: boolean[][] ) {
    // fold the right side to the left
    return combine( grid.map(line => line.slice(0,x)), grid.map(line => line.slice(x+1).reverse()) );
}

function foldY( y: number, grid: boolean[][] ) {
    // fold the bottom up
    return combine( grid.slice(0, y), grid.slice(y+1).reverse() );
}

/** combines two 'grids' of booleans */
function combine( grid1: boolean[][], grid2: boolean[][] ): boolean[][] {
    // normalize the size of each grid in case we didn't fold exactly down the middle of the paper
    const grids = [ grid1, grid2 ];
    const [ rows, cols ] = [ Math.max(...grids.map(g => g.length)), Math.max(...grids.map(g => g[0].length)) ];
    grids.forEach( grid => {
        while ( grid.length < rows ) {
            grid.unshift( new Array(cols).fill(false) );
        }
        grid.forEach( (_,i) => {
            while ( grid[i].length < cols ) {
                grid[i].unshift( false );
            }
        });
    });

    return grid1.map(
        (row, y) => row.map( (v,x) => v || grid2[y][x] )
    );
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => {
        const { grid, instructions } = parseInput( input );
        return Array.from( instructions[0](grid).flat().filter(identity) ).length;
    },
    // function that solves part 2
    ( input: string ) => {
        const { grid, instructions } = parseInput( input );
        instructions.reduce( (grid, instruction) => instruction(grid), grid ).forEach(
            row => console.log( row.map(v => v ? '#' : ' ').join(' ') )
        );
    }
);
