import { intersection, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function parseInput( input: string ) {
    return input.split( '\n' ).map( line => line.split(' | ') ).map( parts => {
        return {
            digits: parts[0].split( ' ' ).map( word => word.split('') ),
            display: parts[1].split( ' ' ).map( word => word.split('') )
        }
    });
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => sum( parseInput(input).map(
        line => line.display.filter( word => [2,3,4,7].includes(word.length) ).length
    )),
    // function that solves part 2
    ( input: string ) => sum( parseInput(input).map( line => {
        // to be able to determine which digit is which, we only need to count the number of segments and compare against the segments that
        // make up digits 1 and 4. The digit 1 has two segments, and the digit 4 has four segments.
        const [ segmentsOf1, segmentsOf4 ] = [ line.digits.find(d => d.length === 2), line.digits.find(d => d.length === 4) ];
        // turn sequences of segment letters into string representations of single decimal digits
        return parseInt(
            line.display.map( segments => {
                switch ( segments.length ) {
                    case 2: return '1';
                    case 3: return '7';
                    case 4: return '4';
                    case 5:
                        return intersection( segments, segmentsOf1 ).length === 2 ? '3' :
                        intersection( segments, segmentsOf4 ).length === 2 ? '2' : '5';
                    case 6:
                        return intersection( segments, segmentsOf1 ).length === 1 ? '6' :
                        intersection( segments, segmentsOf4 ).length === 4 ? '9' : '0';
                    case 7: return '8';
                }
            }).join( '' )
        );
    }))
);
