import { groupBy, memoize, range, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function solve1( input: string ) {
    const positions = input.split( '\n' ).map( line => parseInt(line.split(': ')[1]) );
    const scores = positions.map( s => 0 );
    let numRolls = 0;
    const endScore = 1000;
    const numSpaces = 10;

    const getDieRoll = () => {
        return ++numRolls;
    }

    while ( scores.every(p => p < endScore) ) {
        positions.some( (_, i) => {
            for ( let j = 0; j < 3; j++ ) {
                positions[i] += getDieRoll();
            }
            positions[i] %= numSpaces;
            scores[i] += positions[i] === 0 ? numSpaces : positions[i];
            if ( scores[i] >= endScore ) {
                return true;
            }
        });
    }

    return Math.min( ...scores ) * numRolls;
}

function solve2( input: string ) {
    const startPositions = input.split( '\n' ).map( line => parseInt(line.split(': ')[1]) );
    const startScores = startPositions.map( s => 0 );
    const endScore = 21;
    const numSpaces = 10;

    const rollProbabilities = getRollProbabilities( 3, 3, 3 );

    /** returns the number of wins each player achieves, given a starting state */
    const stepRaw = ( positions: number[], scores: number[], player: number ) => {
        if ( scores[0] >= endScore ) {
            return [ 1, 0 ];
        } else if ( scores[1] >= endScore ) {
            return [ 0, 1 ];
        }
        
        return rollProbabilities.reduce( (wins: number[],p) => {
            const newPositions = positions.slice();
            newPositions[player] = ( newPositions[player] + p.rollTotal ) % numSpaces;
            const newScores = scores.slice();
            newScores[player] += newPositions[player] === 0 ? numSpaces : newPositions[player];
            const newWins = step( newPositions, newScores, (player + 1) % 2 );
            return [ wins[0] + p.occurenceCount * newWins[0], wins[1] + p.occurenceCount * newWins[1] ];
        }, [ 0, 0 ] );
    };

    const step = memoize( stepRaw, (p, s, pl) => `${p.toString()}:${s.toString()}:${pl.toString()}` );

    // return the number of games won by the player that won more games
    return Math.max(
        ...step( startPositions, startScores, 0 )
    );
}

function getRollProbabilities( ...dieSizes: number[] ) {
    let rollCombos = [];
    dieSizes.forEach( dieSize => {
        if ( rollCombos.length === 0 ) {
            rollCombos = range( 1, dieSize + 1 ).map( roll => [roll] );
        } else {
            const newRollCombos = [];
            range( 1, dieSize + 1 ).forEach( roll => {
                rollCombos.forEach( combo => newRollCombos.push(combo.concat(roll)) );
            });
            rollCombos = newRollCombos;
        }
    });
    const numCombos = dieSizes.reduce( (total, dieSize) => total * dieSize, 1 );
    // group roll combos by their sum, then convert the info to how many times each roll total occurs
    return Object.entries( groupBy(rollCombos, sum) ).map( entry => {
        return {
            rollTotal: parseInt( entry[0] ),
            probability: entry[1].length / numCombos,
            occurenceCount: entry[1].length
        };
    });
}


outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => solve1( input ),
    // function that solves part 2
    ( input: string ) => solve2( input )
);
