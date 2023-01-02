import { cloneDeep, range } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

/** return the pair formulae, the ends of the polymer template, and the counts of pairs in the template */
function parseInput( input: string ) {
    const lines = input.split( '\n' );
    // initialize the counts of each pair
    const counts = new Map<string,number>( lines.slice(2).map(line => [line.substring(0,2), 0]) );
    range( lines[0].length - 1 ).forEach( i => increment(counts, lines[0][i]+lines[0][i+1], 1) );
    return {
        ends: [ lines[0][0], lines[0].split('').pop() ],
        formulae: new Map<string,string>(
            lines.slice( 2 ).map( line => line.split(' -> ') as [string,string] )
        ),
        counts: counts
    };
}

function increment( counts: Map<string,number>, key: string, amount: number ) {
    counts.set( key, counts.get(key) + amount );
}

function insert( counts: Map<string,number>, formulae: Map<string,string> ): Map<string,number> {
    const newCounts = cloneDeep( counts );
    // for each pair, inserting a letter in the middle of the pair removes that pair but adds two new pairs
    Array.from( counts.entries() ).filter( entry => entry[1] > 0 ).forEach( entry => {
        increment( newCounts, entry[0], -entry[1] );
        increment( newCounts, entry[0][0] + formulae.get(entry[0]), entry[1] );
        increment( newCounts, formulae.get(entry[0]) + entry[0][1], entry[1] );
    });
    return newCounts;
}

function solve( input: string, steps: number ): number {
    let { ends, formulae, counts } = parseInput( input );
    range( steps ).forEach( i => counts = insert(counts, formulae) );
    // get unique letters from the input
    const freqMap = new Map<string,number>(
        Array.from(
            new Set( Array.from(input.matchAll(/\w/g) ).map( a => a[0] ) )
        ).map( c => [ c, 0 ] )
    );
    // the number of times each letter appears is the number of times it appears in pairs, divided by two.
    // The letters on the ends are a special case since they appear in one pair each
    Array.from( counts.entries() ).forEach(
        entry => entry[0].split('').forEach(
            letter => increment( freqMap, letter, entry[1] )
        )
    );
    ends.forEach( letter => increment(freqMap, letter, 1) );
    // sort by the number of times each letter appears and return the most frequent minus the least frequent
    const sorted = Array.from( freqMap.entries() ).map(
        entry => [ entry[0], entry[1]/2 ] as [string,number]
    ).sort(
        (a, b) => b[1] - a[1]
    );
    return sorted[0][1] - sorted.pop()[1];
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => solve( input, 10 ),
    // function that solves part 2
    ( input: string ) => solve( input, 40 )
);

