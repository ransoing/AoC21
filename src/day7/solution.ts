import { range, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function totalFuel( input: string, fuelUseFunc: (distance: number) => number ) {
    const crabs = input.split( ',' ).map( Number );
    const [ minCrab, maxCrab ] = [ Math.min(...crabs), Math.max(...crabs) ];
    // this could be faster if we keep track of the lowest summed value and stop calculating for the current `position` if the summed value
    // becomes greater than the lowest value
    return Math.min(
        ...range( minCrab, maxCrab + 1 ).map( position => {
            return sum( crabs.map(
                crab => fuelUseFunc( Math.abs(crab - position) )
            ));
        })
    );
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => totalFuel( input, distance => distance ),
    // function that solves part 2
    ( input: string ) => totalFuel( input, distance => {
        const mod = distance % 2;
        return Math.floor( distance / 2 ) * ( 1 + distance - mod ) + mod * distance;
    })
);
