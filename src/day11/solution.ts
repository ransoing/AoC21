import { range, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';
import { XYZ } from '../util/xyz';

function parseInput( input: string ) {
    const grid = input.split( '\n' ).map( line => line.split('').map(Number) );
    return {
        grid: grid,
        points: grid.map( (row,y) => row.map( (_,x) => new XYZ([x,y])) ).flat()
    }
}

/** simulates octopus flashes, modifying the passed grid and returning the number of flashes */
function step( grid: number[][], points: XYZ[] ): number {
    const flashed = new Set<string>(); // <string> is XYZ.prototype.toString()
    points.forEach( bump );
    return flashed.size;

    /** increases an octopus' energy level by 1 and flashes if appropriate */
    function bump( p: XYZ ) {
        if ( !flashed.has(p.toString()) ) {
            grid[p.y][p.x] += 1;
            if ( p.valueIn(grid) > 9 ) {
                // flash this octopus. Set the energy level to 0 and add it to the set so we don't touch this octopus again this step
                grid[p.y][p.x] = 0;
                flashed.add( p.toString() );
                // increase energy of neighbors
                p.neighbors( true ).filter( n => n.valueIn(grid) != null ).forEach( bump );
            }
        }
    }
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => {
        const { grid, points } = parseInput( input );
        return sum( range(0, 100).map(
            i => step( grid, points )
        ));
    },
    // function that solves part 2
    ( input: string ) => {
        const { grid, points } = parseInput( input );
        let i;
        for ( i = 0; step(grid, points) !== points.length; i++ ) {}
        return i + 1;
    },
);
