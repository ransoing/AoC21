import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput3 } from './inputs';
import { Range } from '../util/range';
import { Range3D } from '../util/range3d';

function parseInput( input: string, part2 = false ) {

    const lines = input.split( '\n' ).map( line => {
        const matches = line.match( /(on|off) x=(-?\d+)..(-?\d+),y=(-?\d+)..(-?\d+),z=(-?\d+)..(-?\d+)/ );
        return {
            toggle: matches[1] === 'on',
            cube: new Range3D(
                new Range( parseInt(matches[2]), parseInt(matches[3]) + 1 ),
                new Range( parseInt(matches[4]), parseInt(matches[5]) + 1 ),
                new Range( parseInt(matches[6]), parseInt(matches[7]) + 1 )
            )
        };
    }).filter( r => !r.cube.isInvalid() );

    if ( !part2 ) {
        const range50 = new Range( -50, 51 );
        const part1Range = new Range3D( range50, range50, range50 );
        lines.forEach( line => {
            line.cube = Range3D.intersection([ line.cube, part1Range ]);
        });
    }


    let onVolumes: Range3D[] = [];
    lines.forEach( line => {
        if ( line.toggle ) {
            onVolumes.push( line.cube );
        } else {
            onVolumes = Range3D.uniq(
                onVolumes.map( range => range.difference([line.cube]) ).flat()
            );
        }
    });
    
    const sums = sum(
        Range3D.union( onVolumes ).map( r => r.volume() )
    );
    return sums;
}


outputAnswers(
    testInput3,
    officialInput,
    // function that solves part 1
    ( input: string ) => parseInput( input ),
    // function that solves part 2
    ( input: string ) => parseInput( input, true )
);
