import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

type Sfn = (number | string)[];

function parse( input: string ): Sfn {
    // create a flat array of characters and numbers. Convert numbers to 'number' type and remove commas. Flat arrays are easier to
    // navigate for the purposes of the 'reduce' step when adding two snailfish numbers.
    return input.split( '' ).map( c => '[],'.includes(c) ? c : Number(c) ).filter( c => c !== ',' );
}

function add( num1: Sfn, num2: Sfn ): Sfn {
    const sfn: Sfn = [ '[', ...num1, ...num2, ']' ];
    while( reduce() || split() ) {}
    return sfn;

    /** returns a boolean representing whether any reducing occurred. Mutates sfn */
    function reduce() {
        let brackets = 0;
        return sfn.find( (c, i) => {
            if ( brackets > 4 && typeof c === 'number' && typeof sfn[i+1] === 'number' ) {
                // explode because this is a pair of numbers within more than 4 brackets
                addVal( i - 1, -1, c );
                addVal( i + 2, 1, sfn[i+1] as number );
                sfn.splice( i - 1, 4, 0 );
                return true;
            }
            if ( typeof c === 'number' ) {
                return false;
            }
            brackets += '] ['.indexOf( c ) - 1;
        }) != null;
    }

    /** assists in reducing. Adds the given value to the first number encountered in a given direction */
    function addVal( startI: number, change: number, valToAdd: number ) {
        let i = startI;
        while ( sfn[i] != null ) {
            if ( typeof sfn[i] === 'number' ) {
                (sfn[i] as number) += valToAdd;
                break;
            }
            i += change;
        }
    }

    /** returns a boolean representing whether any splitting occurred. Mutates sfn */
    function split() {
        return sfn.find( (c, i) => {
            if ( typeof c === 'number' && c > 9 ) {
                sfn.splice( i, 1, '[', Math.floor(c/2), Math.ceil(c/2), ']' );
                return true;
            }
        }) != null;
    }
}

function unparse( sfn: Sfn ): any[] {
    // convert the flat array to a deep multidimensional array, by adding commas back in and parsing as JSON
    return JSON.parse(
        sfn.join( '' ).replaceAll( /\d\[|\d\d|\]\d|\]\[/g, v => `${v[0]},${v[1]}` )
    );
}

function findMagnitude( arg: number | any[] ) {
    return typeof arg === 'number' ? arg : 3 * findMagnitude( arg[0] ) + 2 * findMagnitude( arg[1] );
}


outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => {
        const total = input.split( '\n' ).map( parse ).reduce( (total, line) => add(total,line) );
        return findMagnitude( unparse(total) );
    },
    // function that solves part 2
    ( input: string ) => {
        const sfns = input.split( '\n' ).map( parse );
        return Math.max(
            ...sfns.map(
                sfn => sfns.filter( sfn2 => sfn2 !== sfn ).map(
                    sfn2 => findMagnitude( unparse(add(sfn,sfn2)) )
                )
            ).flat()
        );
    }
);
