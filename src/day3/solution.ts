import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function parseInput( input: string ) {
    return input.split( '\n' ).map( row => row.split('').map(Number) );
}

function solve1( input: string ) {
    const rows = parseInput( input );
    const gamma = parseInt( mostCommonBits(rows).join( '' ), 2 );
    const epsilon = parseInt( leastCommonBits(rows).join( '' ), 2 );
    return gamma * epsilon;
}

function mostCommonBits( rows: number[][], invert = false ): string[] {
    const sums = rows[0].map( (_, i) => sum(rows.map(row => row[i])) );
    return sums.map( sum => sum >= rows.length / 2 ? invert ? '0' : '1' : invert? '1' : '0' );
}

const leastCommonBits = rows => mostCommonBits( rows, true );

function getRating( input: string, bitGetter = mostCommonBits ) {
    let rows = parseInput( input );
    for ( let bit = 0; bit < rows[0].length; bit++ ) {
        const priorityBits = bitGetter( rows );
        rows = rows.filter( row => row[bit] === Number(priorityBits[bit]) );
        if ( rows.length === 1 ) {
            return parseInt( rows[0].join(''), 2 );
        }
    }
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => solve1( input ), // function that solves part 1
    ( input: string ) => getRating( input, mostCommonBits ) * getRating( input, leastCommonBits )  // function that solves part 2
);
