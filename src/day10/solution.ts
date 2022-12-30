import { officialInput, testInput } from './inputs';

const closers = new Map([ ['(',')'], ['[',']'], ['{','}'], ['<','>'] ]);
const errorPoints = new Map([ [')',3], [']',57], ['}',1197], ['>',25137] ]);
const incompletePoints = new Map([ ['(',1], ['[',2], ['{',3], ['<',4] ]);

function solve( input: string, testStr = '' ) {
    let errorScore = 0;
    const incompleteScores = [];
    input.split( '\n' ).forEach( line => {
        // for part 1, find the first character that doesn't match what's on the stack
        const stack = [];
        const corruptChar = line.split( '' ).find( char => {
            if ( closers.has(char) ) {
                stack.push( char );
                return false;
            } else if ( closers.get(stack.pop() ) !== char ) {
                return true;
            }
        });
        errorScore += errorPoints.get( corruptChar ) ?? 0;
        // for part 2, check if this is an incomplete line
        if ( corruptChar == null ) {
            incompleteScores.push(
                stack.reduceRight( (total,char) => total = total * 5 + incompletePoints.get(char), 0 )
            );
        }
    });

    console.log( `Answer for part 1${testStr}: `, errorScore );
    console.log( `Answer for part 2${testStr}: `, incompleteScores.sort( (a, b) => a - b )[ Math.floor(incompleteScores.length / 2) ] );
}

solve( testInput, ' (test)' );
solve( officialInput );
