import { inRange, range } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

/** Returns an array of [x1, x2, y1, y2], like [20, 30, -10, -5] */
function parseInput( input: string ) {
    return input.match( /x=(\d+)..(\d+), y=(-?\d+)..(-?\d+)/ ).slice( 1 ).map( Number );
}

/** Returns the sum of all the numbers up to `num` */
const summation = ( num: number ) => ( num + 1 ) * Math.floor( num / 2 ) + ( num % 2 === 1 ? Math.ceil(num/2) : 0 );
const signOf = ( n: number ) => n / Math.abs( n );

/**
 * returns [initial velocity, time] pairs where that the the probe ends in the [axisMin,axisMax] range where axisMin <= position <= axisMax
 */
function findPairs2( axisMin: number, axisMax: number, allowNegativeVelocity = false ): { v: number, t: number }[] {
    const sign = signOf( axisMin );
    const biggest = sign * Math.max( ...[axisMin, axisMax].map(Math.abs) ) + sign * 1;
    let vRange = range( allowNegativeVelocity ? -biggest : 0, biggest );
    return vRange.map( v => {
        // for this starting velocity, reduce the velocity by 1 each step and find time steps where the position is within the axis range
        let [ position, time ] = [ v, 1 ];
        let pairs: { v: number, t: number }[] = [];
        while ( allowNegativeVelocity ? position > biggest : position < biggest ) {
            if ( inRange(position, axisMin, axisMax + 1 ) ) {
                pairs.push({ v: v, t: time });
            }
            position += v - time;
            time++;
            if ( !allowNegativeVelocity && time > v ) {
                break;
            }
        }
        return pairs;
    }).flat();
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => {
        const box = parseInput( input );
        // The greatest speed would have the probe go from the starting Y position to the bottom of the box in one step.
        // The vertical velocity on the step where we hit the box is 1 greater than the starting velocity.
        // The highest y position is the sum from 1 to n where n is the starting speed, because the vertical speed decreases by 1 each step
        return summation( -box[2] - 1 );
    },
    // function that solves part 2
    ( input: string ) => {
        const box = parseInput( input );
        // for each axis, find pairs of velocities and timesteps that get the probe within the target area on an integer time step
        const xPairs = findPairs2( box[0], box[1] );
        const yPairs = findPairs2( box[2], box[3], true );
        // for each y pair, get unique combos of (x,y) where the time steps are the same, or where x reaches 0 velocity
        return new Set(
            yPairs.map(
                yPair => xPairs.filter(
                    xPair => xPair.t === yPair.t || ( xPair.t === xPair.v && yPair.t > xPair.t )
                ).map( xPair => `${xPair.v},${yPair.v}` )
            ).flat()
        ).size;
    }
);
