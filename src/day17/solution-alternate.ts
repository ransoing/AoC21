import { inRange, range } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';
const nerdamer = require( 'nerdamer/all.min' );

/** Returns an array of [x1, x2, y1, y2], like [20, 30, -10, -5] */
function parseInput( input: string ) {
    return input.match( /x=(\d+)..(\d+), y=(-?\d+)..(-?\d+)/ ).slice( 1 ).map( Number );
}

/** Returns the sum of all the numbers up to `num` */
const summation = ( num: number ) => ( num + 1 ) * Math.floor( num / 2 ) + ( num % 2 === 1 ? Math.ceil(num/2) : 0 );
const isRound = ( n: number ) => Math.round( n ) === n;
const signOf = ( n: number ) => n / Math.abs( n );

// an equation that expresses values of initial velocity and number of steps that result in the desired position on an axis.
// v is initial velocity, t is number of steps (time).
const positionEquation = ( targetPosition: number ) => `${targetPosition}=v*t*(1 + 1/(v*2)) - t^2/2`;

function findPairs( axisPosition: number, allowOppositeVelocity = false ): { v: number, t: number }[] {
    // minVelocity is the lowest velocity which might hit the target value. Any lower will definitely fall short.
    const minVelocity = Math.floor( Math.sqrt(1/4+2*Math.abs(axisPosition)) - 0.5 );
    // Get an expression for t, then substitute possible integer values of v to find values of t and v that result in the given axis
    // value being hit. Ignore non-integer values of t.
    const tEquals: string[] = nerdamer.solveEquations( positionEquation(axisPosition), 't' );
    const sign = signOf( axisPosition );
    const positionPlus = axisPosition + sign * 1;
    let vRange = allowOppositeVelocity ? range( -positionPlus, positionPlus ) : range( sign * minVelocity, axisPosition + sign * 1 );
    return tEquals.map( eq => 
        vRange.map( v => {
            return {
                v: v,
                t: Number( nerdamer(eq, {v: v}).evaluate().text() )
            };
        }).filter( pair => isRound(pair.t) )
    ).flat();
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
        const xPairs = range( box[0], box[1] + 1 ).map( x => findPairs(x).filter( pair => pair.t <= pair.v ) ).flat();
        const yPairs = range( box[2], box[3] + 1 ).map( y => findPairs(y, true).filter( pair => pair.t > 0 ) ).flat();
        // for each y pair, get unique combos of (x,y) where the time steps are the same, or x reaches 0 velocity
        return new Set(
            yPairs.map(
                yPair => xPairs.filter(
                    xPair => xPair.t === yPair.t || ( xPair.t === xPair.v && yPair.t > xPair.t )
                ).map( xPair => `${xPair.v},${yPair.v}` )
            ).flat()
        ).size;
    }
);
