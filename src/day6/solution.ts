import { range, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function parseInput( input: string, numDays: number ) {
    // the days array has values that represent how many new laternfish will be created on that day
    const days = range( numDays ).map( _ => 0 );
    const initialFish = input.split( ',' ).map( Number );
    initialFish.forEach( fish => {
        for ( let i = fish; i < numDays; i += 7 ) {
            days[i]++;
        }
    });

    days.forEach( (_, dayNum) => {
        // `newFish` is the number of new fish that are born on this day. Record when these new fish will create further new fish later.
        // 9 days from now and every 7 days thereafter, the fish born today will birth new fish.
        for ( let i = dayNum + 9; i < numDays; i += 7 ) {
            days[i] += days[dayNum];
        }
    });

    return sum( days ) + initialFish.length;
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => parseInput( input, 80 ),
    // function that solves part 2
    ( input: string ) => parseInput( input, 256 )
);
