import { difference, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

interface INode {
    connections: INode[];
    key: string;
}

function parseInput( input: string ) {
    const nodes = new Map<string,INode>();
    // make a two-way linked map
    input.split( '\n' ).forEach( line => {
        const nodePair = line.split( '-' ).map( name => nodes.get(name) ?? { connections: [], key: name } );
        nodePair.forEach( (node, i) => {
            node.connections.push( nodePair[(i+1)%2] )
            nodes.set( node.key, node );
        });
    });
    return nodes;
}

function step( bannedNodes: INode[], currentNode: INode, end: INode, doubleVisitNode?: INode, doubleVisitCount = 0 ) {
    // return 1 if it is 'end', or otherwise the sum of valid steps to children (which could be 0 if there are no options)
    // don't allow recording this end if we're on a double-visit run and haven't visited the specific node twice
    if ( currentNode === end ) {
        return doubleVisitNode == null || doubleVisitCount == 2 ? 1 : 0;
    }
    if ( currentNode === doubleVisitNode ) {
        if ( ++doubleVisitCount > 1 ) {
            bannedNodes = bannedNodes.concat( [currentNode] );
        };
    } else if ( currentNode.key === currentNode.key.toLowerCase() ) {
        bannedNodes = bannedNodes.concat( [currentNode] );
    }
    return sum(
        difference( currentNode.connections, bannedNodes ).map(
            node => step( bannedNodes, node, end, doubleVisitNode, doubleVisitCount )
        )
    );
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => {
        const nodes = parseInput( input );
        return step( [], nodes.get('start'), nodes.get('end') )
    },
    // function that solves part 2
    ( input: string ) => {
        const nodes = parseInput( input );
        // get an array of all small caves except start and end. For each, do the same as in part 1 but allow the node to be double-visited
        return sum(
            Array.from( nodes.values() ).filter(
                node => node.key === node.key.toLowerCase() && ![ 'start','end' ].includes( node.key )
            ).map(
                node => step( [], nodes.get('start'), nodes.get('end'), node )
            ).concat(
                // add the case where we don't visit any nodes twice
                [ step( [], nodes.get('start'), nodes.get('end') ) ]
            )
        );
    }
);
