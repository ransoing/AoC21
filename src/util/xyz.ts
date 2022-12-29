import { isEqual, sum } from "lodash";

type Coordinate = XYZ | number[];

/** A class that gives convenient tools for dealing with 2D or 3D coordinates */
export class XYZ {

    /** Takes either an XYZ or number[] and converts it to XYZ */
    static normalize( c: Coordinate ): XYZ {
        return c instanceof XYZ ? c : new XYZ( c );
    }

    /** Adds multiple coordinates together and returns a new object */
    static sum( ...cs: Coordinate[] ): XYZ {
        const xyzs = cs.map( XYZ.normalize );
        return new XYZ([
            sum( xyzs.map(c => c.x) ),
            sum( xyzs.map(c => c.y) ),
            sum( xyzs.map(c => c.z) )
        ]);
    }

    public x: number;
    public y: number;
    public z: number;

    constructor( c: number[] ) {
        this.x = c[0] ?? 0;
        this.y = c[1] ?? 0;
        this.z = c[2] ?? 0;
    }

    /** Adds additional coordinates, modifying the current one, and returns the original object */
    add( ...cs: Coordinate[] ): XYZ {
        const xyzs = cs.map( XYZ.normalize );
        [ 'x', 'y', 'z' ].forEach( prop => this[prop] += sum( xyzs.map(c => c[prop]) ) );
        return this;
    }

    /** Adds coordinates to the current one, returning a new object */
    plus( ...cs: Coordinate[] ): XYZ {
        return this.copy().add( ...cs );
    }

    /** Subtracts additional coordinates, modifying the current one, and returns the original object */
    subtract( ...cs: Coordinate[] ): XYZ {
        const xyzs = cs.map( XYZ.normalize );
        [ 'x', 'y', 'z' ].forEach( prop => this[prop] += sum( xyzs.map(c => -c[prop]) ) );
        return this;
    }

    /** Subtracts additional coordinatess, returning a new object */
    minus( ...cs: Coordinate[] ): XYZ {
        return this.copy().subtract( ...cs );
    }

    /** Multiplies all values by a given scalar. Modifies the original object */
    multiply( scalar: number ): XYZ {
        [ 'x', 'y', 'z' ].forEach( prop => this[prop] *= scalar );
        return this;
    }

    /** Multiplies all values by a given scalar, returning a new object */
    times( scalar: number ): XYZ {
        return this.copy().multiply( scalar );
    }

    /** Returns a copy of the object */
    copy(): XYZ {
        return new XYZ([ this.x, this.y, this.z ]);
    }

    /**
     * Returns a new XYZ object whose values are either 0, 1, or -1, representing whether the x, y, and z values are
     * positive, negative, or 0
     */
    toSign(): XYZ {
        return new XYZ([
            this.x === 0 ? 0 : this.x / Math.abs( this.x ),
            this.y === 0 ? 0 : this.y / Math.abs( this.y ),
            this.z === 0 ? 0 : this.z / Math.abs( this.z )
        ]);
    }

    eq( c: Coordinate ): boolean {
        const xyz = XYZ.normalize( c );
        return xyz != null && this.x === xyz.x && this.y === xyz.y && this.z === xyz.z;
    }

    toString(): string {
        return `${this.x},${this.y},${this.z}`;
    }
}