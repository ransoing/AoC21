import { fromPairs, range, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';
import { XYZ } from '../util/xyz';

interface IPoint {
    risk: number;
    xyz: XYZ;
}

function parseInput( input: string ) {
    return input.split( '\n' ).map( l => l.split('').map(Number) );
}

function solve( numGrid: number[][] ) {
    // build a graph from the number grid
    const Graph = require( 'node-dijkstra' );
    const grid = new Graph();
    const nums = new Map<string,IPoint>(
        numGrid.map(
            (line,y) => line.map(
                (risk,x) => [ `${x},${y},0`, { risk: risk, xyz: new XYZ([x,y]) } ] as [string, IPoint]
            )
        ).flat()
    );
    Array.from( nums.entries() ).forEach(
        entry => grid.addNode(
            entry[0],
            fromPairs(
                entry[1].xyz.neighbors().filter( n => nums.has(n.toString()) ).map(
                    n => [ n.toString(), nums.get(n.toString()).risk ]
                )
            )
        )
    );
    // use dijkstra to find the best path and sum the risk levels in that path
    const path = grid.path( '0,0,0', (numGrid[0].length - 1) + ',' + (numGrid.length - 1) + ',0' );
    return sum(
        path.slice( 1 ).map( node => nums.get(node).risk )
    );
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => solve( parseInput(input) ),
    // function that solves part 2
    ( input: string ) => {
        // build a larger grid of 5x5 copies of this grid, incrementing values for each copy as per the puzzle instructions
        return solve(
            range( 5 ).map(
                metaRow => parseInput( input ).map(
                    line => range( 5 ).map( metaCol => line.map(v => (v + metaRow + metaCol - 1) % 9 + 1) ).flat()
                )
            ).flat()
        );
    }
);
