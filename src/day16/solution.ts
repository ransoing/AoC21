import { add, multiply, range } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

// this one's really messy and I didn't like it so I'm not going to clean it up.

interface IPacketInfo {
    version: number;
    value: number;
}

function solve( input: string ): IPacketInfo {
    // parse one hexadecimal character at a time from a string and return a "binary" string of 0's and 1's
    let bin = input.split( '' ).map( c => parseInt(c, 16).toString(2).padStart(4,'0') ).join( '' );

    // consumes an entire packet
    function parsePacket(): IPacketInfo {
        // remove the packet from `bin` and return the version
        if ( bin.length < 6 ) {
            bin = '';
            return { version: 0, value: 0 };
        }
        const version = consumeAsNumber( 3 );
        const packetType = consumeAsNumber( 3 );
        if ( packetType === 4 ) {
            let part = '';
            let binary = '';
            do {
                part = consume( 5 );
                binary += part.substring( 1 );
            } while ( part[0] === '1' );
            return { version: version, value: parseInt(binary,2) };
        } else {
            const op = packetType === 0 ? { func: add, startVal: 0 } :
                packetType === 1 ? { func: multiply, startVal: 1 } :
                packetType === 2 ? { func: Math.min, startVal: Number.MAX_VALUE } :
                packetType === 3 ? { func: Math.max, startVal: -Number.MAX_VALUE } :
                packetType === 5 ? { func: (v1, v2) => v1 == null ? v2 : (v1 > v2 ? 1 : 0), startVal: null } :
                packetType === 6 ? { func: (v1, v2) => v1 == null ? v2 : (v1 < v2 ? 1 : 0), startVal: null } :
                { func: (v1, v2) => v1 == null ? v2 : (v1 == v2 ? 1 : 0), startVal: null };

            const lengthType = consumeAsNumber( 1 );
            const totals: IPacketInfo = { version: version, value: op.startVal };

            if ( lengthType === 0 ) {
                const subPacketsLength = consumeAsNumber( 15 );
                const originalLength = bin.length;
                while ( bin.length > originalLength - subPacketsLength ) {
                    consumeSubpacket( totals, op.func );
                }
            } else {
                range( consumeAsNumber(11) ).forEach( i => consumeSubpacket(totals, op.func) );
            }

            return totals;
        }
    }

    /** mutates the given packetinfo and adds the totals of the subpackets */
    function consumeSubpacket( packetInfo: IPacketInfo, op: (a,b) => number ) {
        const consumed = parsePacket();
        packetInfo.version += consumed.version;
        packetInfo.value = op( packetInfo.value, consumed.value );
    }
    
    function consumeAsNumber( numBits: number ) {
        return parseInt( consume(numBits), 2 );
    }

    function consume( numBits: number ) {
        const consumed = bin.substring( 0, numBits );
        bin = bin.substring( numBits );
        return consumed;
    }

    return parsePacket();
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => solve( input ).version,
    // function that solves part 2
    ( input: string ) => solve( input ).value
);
