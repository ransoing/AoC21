import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function parseInput( input: string ) {
    const sumLines = ( startLetter: string ) => sum(
        input.split( '\n' ).map( line => line.startsWith(startLetter) ? Number(line.split(' ')[1]) : 0 )
    );
    
    return sumLines( 'f' ) * ( sumLines('d') - sumLines('u') );
}

function parseInput2( input: string ) {
    let [ distance, depth, aim ] = [ 0, 0, 0 ];
    input.split( '\n' ).forEach( line => {
        const num = Number( line.split(' ')[1] );
        if ( line.startsWith('d') ) {
            aim += num;
        } else if ( line.startsWith('u') ) {
            aim -= num;
        } else {
            distance += num;
            depth += aim * num;
        }
    });
    
    return depth * distance;
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => parseInput( input ), // function that solves part 1
    ( input: string ) => parseInput2( input ) // function that solves part 2
);
