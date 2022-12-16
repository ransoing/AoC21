import { range } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function solve( input: string, accommodateDiagonals = false ) {
    // parse the input into pairs of x,y coordinates
    const paths = input.split( '\n' ).map(
        line => line.split( ' -> ' ).map(
            coords => coords.split( ',' ).map( Number )
        )
    );

    // find the maximum x and y values to know the limits of the grid
    const [ maxX, maxY ] = [ 0, 1 ].map(
        i => 1 + Math.max( ...paths.flat().map(coords => coords[i]) )
    );
    
    // initialize a grid with all 0's. We will mark how many times each spot is hit by a line segment
    const grid = range( maxX ).map(
        _ => new Array( maxY ).fill( 0 )
    );
    paths.forEach( path => {
        // if x1 === x2 or if y1 === y2, it's a straight line
        if ( [0,1].some(i => path[0][i] === path[1][i]) ) {
            // one of these loops will execute exactly once
            rangeIncl( path[0][0], path[1][0] ).forEach(
                x => rangeIncl( path[0][1], path[1][1] ).forEach(
                    y => grid[x][y]++
                )
            )
        } else if ( accommodateDiagonals ) {
            // otherwise, by the puzzle's description, this is a 45-degree line
            const [ xs, ys ] = [ 0, 1 ].map(
                i => rangeIncl( path[0][i], path[1][i] )
            );
            xs.forEach( (_, i) => grid[xs[i]][ys[i]]++ );
        }
    });
    
    // return the number of points in the grid that were visited by a line segment more than once
    return grid.flat().filter( p => p > 1 ).length;
}

// returns a range of numbers that includes the 'to' number, unlike lodash's `range`
const rangeIncl = ( from: number, to: number ) => [ ...range(from, to), to ];

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => solve( input ),
    // function that solves part 2
    ( input: string ) => solve( input, true )
);
