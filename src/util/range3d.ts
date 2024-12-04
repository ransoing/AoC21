import { Range } from './range';

export class Range3D {

    /**
     * returns an array of Range3Ds representing a union of all given ranges.
     */
    static union( ranges: Range3D[] ) {
        if ( ranges.length === 0 ) {
            return [];
        }
        
        // reduce the array by eliminating ranges that are entirely contained within other ranges
        // i.e. only include the ranges which are not contained in any other range
        // console.log( ranges.length );
        ranges = ranges.filter( (r1, i) => {
            return !ranges.some( (r2, j) => i !== j && r2.includesRange3D(r1) );
        });

        if ( ranges.length === 1 ) {
            return [ ranges[0].copy() ];
        }


        // for each range, find the difference between the range and all other ranges.
        // Then add those differences to the 'chunks' array and remove the range from the original array
        let chunkSets: Range3D[][] = [];
        while ( ranges.length > 0 ) {
            chunkSets.push( ranges.shift().difference(ranges) );
        }
        return chunkSets.flat();
    }

    /**
     * returns the Range3D where all given ranges intersect. The returned range will be invalid
     * if there is no overlap, which can be easily checked via `isInvalid`.
     * Keep in mind that a Range represents all values where start <= value < end.
     */
    static intersection( ranges: Range3D[] ) {
        if ( ranges.length === 0 ) {
            return Range3D.makeInvalidRange();
        } else if ( ranges.length === 1 ) {
            return ranges[0].copy();
        }
        try {
            return new Range3D(
                new Range(
                    Math.max( ...ranges.map(r => r.x.start) ),
                    Math.min( ...ranges.map(r => r.x.end) )
                ),
                new Range(
                    Math.max( ...ranges.map(r => r.y.start) ),
                    Math.min( ...ranges.map(r => r.y.end) )
                ),
                new Range(
                    Math.max( ...ranges.map(r => r.z.start) ),
                    Math.min( ...ranges.map(r => r.z.end) )
                )
            );
        } catch( e ) {
            return Range3D.makeInvalidRange();
        }
    }

    /** creates a Range3D from a string formatted like `x1,x2:y1,y2:z1,z2`, i.e. `4,9:-1,5:50,60` */
    static fromString( str: string ) {
        const numArray = str.split( ':' ).map(
            coords => coords.split( ',' ).map(
                num => parseInt( num )
            )
        );
        return new Range3D(
            new Range( numArray[0][0], numArray[0][1] ),
            new Range( numArray[1][0], numArray[1][1] ),
            new Range( numArray[2][0], numArray[2][1] )
        );
    }

    /** returns an array of ranges with duplicates removed from the input array */
    static uniq( ranges: Range3D[] ) {
        // convert to strings and add to a Set for super speed, then convert from strings back to Range3Ds
        return Array.from(
            new Set( ranges.map(c => c.toString()) )
        ).map(
            rangeString => Range3D.fromString( rangeString )
        )
    }

    static makeInvalidRange() {
        return new Range3D( Range.makeInvalidRange(), Range.makeInvalidRange(), Range.makeInvalidRange() );
    }

    /**
     * @@ very slow
     * given an array of Range3Ds which have no intersection, simplifies the array by merging Range3Ds which share a common border.
     * Returns a new array of Range3Ds
     */
    static simplify( uniqueChunks: Range3D[] ) {
        uniqueChunks = uniqueChunks.slice();
        let mergedTwo = false;
        do {
            mergedTwo = false;
            for ( let i = 0; i < uniqueChunks.length - 1; i++ ) {
                for ( let j = i + 1; j < uniqueChunks.length; j++ ) {
                    const [ a, b ] = [ uniqueChunks[i], uniqueChunks[j] ];
                    // if the two Range3Ds have adjacent x ranges but the same y and z ranges, modify one of the Range3Ds to include the
                    // space occupied by both, and remove the other from the array
                    if (
                        a.y.eq(b.y) && a.z.eq(b.z) &&
                        ( a.x.end === b.x.start || a.x.start === b.x.end )
                    ) {
                        a.x = new Range( Math.min(a.x.start, b.x.start), Math.max(a.x.end, b.x.end) );
                        uniqueChunks.splice( j, 1 );
                        mergedTwo = true;
                    } else if (
                        // do the same thing but check if they have adjacent y ranges and share x/z ranges
                        a.x.eq(b.x) && a.z.eq(b.z) &&
                        ( a.y.end === b.y.start || a.y.start === b.y.end )
                    ) {
                        a.y = new Range( Math.min(a.y.start, b.y.start), Math.max(a.y.end, b.y.end) );
                        uniqueChunks.splice( j, 1 );
                        mergedTwo = true;
                    } else if (
                        // do the same thing but check if they have adjacent z ranges and share x/y ranges
                        a.x.eq(b.x) && a.y.eq(b.y) &&
                        ( a.z.end === b.z.start || a.z.start === b.z.end )
                    ) {
                        a.z = new Range( Math.min(a.z.start, b.z.start), Math.max(a.z.end, b.z.end) );
                        uniqueChunks.splice( j, 1 );
                        mergedTwo = true;
                    }
                    if ( mergedTwo ) {
                        break;
                    }
                }
                if ( mergedTwo ) {
                    // break;
                }
            }
        } while ( mergedTwo );

        return uniqueChunks;
    }

    constructor(
        public x: Range,
        public y: Range,
        public z: Range
    ) {}

    /** makes a copy of the Range3D object and returns it */
    copy() {
        return new Range3D( this.x.copy(), this.y.copy(), this.z.copy() );
    }

    /** returns whether two Range3D objects have the same x and y ranges */
    eq( range: Range3D ) {
        return this.x.eq( range.x ) && this.y.eq( range.y ) && this.z.eq( range.z );
    }

    /** returns the total volume encompassed by this Range3D */
    volume() {
        return this.x.length() * this.y.length() * this.z.length();
    }

    toString() {
        return `${this.x.toString()}:${this.y.toString()}:${this.z.toString()}`;
    }

    isInvalid() {
        return this.x.isInvalid() || this.y.isInvalid() || this.z.isInvalid();
    }

    /** returns whether this Range3D has any overlap with another Range3D */
    intersectsWith( range: Range3D ) {
        return this.x.intersectsWith( range.x ) && this.y.intersectsWith( range.y ) && this.z.intersectsWith( range.z );
    }

    /** returns whether this entirely contains a given Range3D */
    includesRange3D( range: Range3D ) {
        return this.x.includesRange( range.x ) && this.y.includesRange( range.y ) && this.z.includesRange( range.z );
    }

    /**
     * splits the current Range3D at a given x value and returns two Range3Ds.
     * If the given number is outside the range, one of the two returned ranges will be invalid.
     */
    splitAtX( num: number ) {
        if ( this.isInvalid() ) {
            return [ Range3D.makeInvalidRange(), Range3D.makeInvalidRange() ];
        } else {
            return this.x.splitAt( num ).map(
                r => new Range3D( r, this.y.copy(), this.z.copy() )
            );
        }
    }

    /**
     * splits the current Range3D at a given y value and returns two Range3Ds.
     * If the given number is outside the range, one of the two returned ranges will be invalid.
     */
    splitAtY( num: number ) {
        if ( this.isInvalid() ) {
            return [ Range3D.makeInvalidRange(), Range3D.makeInvalidRange() ];
        } else {
            return this.y.splitAt( num ).map(
                r => new Range3D( this.x.copy(), r, this.z.copy() )
            );
        }
    }

    /**
     * splits the current Range3D at a given z value and returns two Range3Ds.
     * If the given number is outside the range, one of the two returned ranges will be invalid.
     */
    splitAtZ( num: number ) {
        if ( this.isInvalid() ) {
            return [ Range3D.makeInvalidRange(), Range3D.makeInvalidRange() ];
        } else {
            return this.z.splitAt( num ).map(
                r => new Range3D( this.x.copy(), this.y.copy(), r )
            );
        }
    }

    /** returns an array of Range3Ds representing areas from this range that aren't contained in the given ranges */
    difference( ranges: Range3D[] ) {
        // only get the ranges that intersect with this one
        ranges = ranges.filter( r => this.intersectsWith(r) && r !== this );
        if ( ranges.length === 0 ) {
            return [ this.copy() ];
        }
        // if this range is entirely included in another, return an empty array
        if ( ranges.some( r => r.includesRange3D(this) ) ) {
            return [];
        }

        // chunk the first range by all others - we can get away with only slicing the first one because we are finding the parts of this
        // range that are not contained by other ranges
        const chunks: Range3D[] = this._chunkByMultipleRange3Ds( ranges );
        // keep only the chunks that are not included in any other ranges
        const differingChunks = chunks.filter(
            chunk => ranges.every( range => !range.includesRange3D(chunk) )
        );
        // reduce the remaining chunks to as few ranges as possible
        return Range3D.simplify( differingChunks );
    }


    /**
     * splits up the current Range3D into smaller ones, slicing it by the x, y, and z values found in all the given Range3Ds.
     * Does not return empty or invalid ranges.
     */
    private _chunkByMultipleRange3Ds( ranges: Range3D[] ) {
        // get all x, y, and z values contained in this range, and sort them

        const allXs = Array.from( new Set(
            [ this.x.start, this.x.end ].concat(
                ranges.map( r => [r.x.start, r.x.end] ).flat().filter( x => this.x.includesValue(x) )
            )
        )).sort( (a,b) => a - b );

        const allYs = Array.from( new Set(
            [ this.y.start, this.y.end ].concat(
                ranges.map( r => [r.y.start, r.y.end] ).flat().filter( y => this.y.includesValue(y) )
            )
        )).sort( (a,b) => a - b );

        const allZs = Array.from( new Set(
            [ this.z.start, this.z.end ].concat(
                ranges.map( r => [r.z.start, r.z.end] ).flat().filter( z => this.z.includesValue(z) )
            )
        )).sort( (a,b) => a - b );

        // return a unique set of Range3Ds split up by the defined x, y, and z values. All Range3Ds together make up the entirety of this range
        const chunks: Range3D[] = [];
        for ( let i = 0; i < allXs.length; i++ ) {
            for ( let j = 0; j < allYs.length; j++ ) {
                for ( let k = 0; k < allZs.length; k++ ) {
                    chunks.push(
                        new Range3D(
                            new Range( allXs[i], allXs[i+1] ?? this.x.end ),
                            new Range( allYs[j], allYs[j+1] ?? this.y.end ),
                            new Range( allZs[k], allZs[k+1] ?? this.z.end )
                        )
                    );
                }
            }
        }

        return chunks;
    }

}
