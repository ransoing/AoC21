import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';
import { XYZ } from '../util/xyz';

/** returns a grid of numbers */
function parseInput( input: string ) {
    const map = input.split( '\n' ).map(
        line => line.split('').map( Number )
    );
    return {
        map: map,
        points: map.map(
            (row, y) => row.map( (v, x) => new XYZ([x,y]) )
        ).flat()
    }
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => {
        const { map, points } = parseInput( input );
        return sum(
            points.filter(
                p => p.neighbors().every(
                    neighbor => ( neighbor.valueIn(map) ?? 10 ) > p.valueIn(map)
                )
            ).map( p => map[p.y][p.x] + 1 )
        )
    },
    // function that solves part 2
    ( input: string ) => {
        const { map, points } = parseInput( input );
        // for each point less than height 9, do a breadth-first search to find the area of the basin
        const basinSizes = [];
        const visitedPoints = new Set<string>(); // XYZ strings
        points.forEach( p => {
            if ( (p.valueIn(map) ?? 9) !== 9 && !visitedPoints.has(p.toString()) ) {
                const { visited } = p.bfs({
                    canVisitNeighbor: n => ( n.valueIn(map) ?? 9 ) !== 9
                });
                Array.from( visited.values() ).forEach( v => visitedPoints.add(v) );
                basinSizes.push( visited.size );
            }
        });
        return basinSizes.sort( (a,b) => b - a ).slice( 0, 3 ).reduce( (total,v) => total * v, 1 );
    }
);
