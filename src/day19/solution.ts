import { difference, intersectionBy, range } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';
import { XYZ } from '../util/xyz';

class Point extends XYZ {
    public distances: { distance: number, point: Point }[] = [];
}

function parseInput( input: string ): Point[][] {
    return input.replace( /-+ scanner \d+ -+\n/g, '' ).split( '\n\n' ).map(
        scannerText => {
            const points = scannerText.split( '\n' ).map(
                line => new Point( line.split( ',' ).map(Number) )
            );
            points.forEach(
                p => p.distances = points.filter( p2 => p2 !== p ).map( p2 => {
                    return { distance: p.distanceTo(p2), point: p2 }
                })
            );
            return points;
        }
    );
}

/** Round to 8 sig figs */
const round8 = ( n: number ) => n.toPrecision( 8 );

/** Returns a function that rotates the second point's orientation to match the first point's orientation */
function findRotation( diff1: XYZ, diff2: XYZ ) {
    const [ axes, inversions ] = [ ['x','y','z'], [-1,1] ];
    let func: ( p: XYZ ) => Point;
    
    function chooseAxis( axis: string[], inversion: number[] ) {
        if ( axis.length === 3 && inversion.length === 3 ) {
            func = ( p: XYZ ) => new Point( range(3).map(i => p[axis[i]] * inversion[i]) );
            return func( diff2 ).eq( diff1 );
        } else {
            return difference( axes, axis ).find(
                a => inversions.find( i => chooseAxis([...axis, a], [...inversion, i]) )
            );
        }
    }
    chooseAxis( [], [] );
    return func;
}

/**
 * Returns an 2D array of beacons which contains normalized locations of beacons for each scanner. Also returns locations of scanners
 * relative to the first scanner
 */
function buildBeaconMap( input: string ) {
    const beacons = parseInput( input );
    // for each scanner, find another scanner that sees at least 12 of the same overlapping beacons. We can detect this by checking the
    // distances between beacons. If a beacon in one set has at least 11 neighboring beacons at distances that perfectly match those of
    // a beacon in another set, then it's highly likely that those are the same beacon.
    // We'll merge all scanners' maps into the map of the first scanner

    let [ fixedQueue, unfixedQueue, scannerLocations ] = [ [beacons[0]], beacons.slice(1), [ new XYZ([0,0,0])] ];
    while ( unfixedQueue.length > 0 ) {
        if ( fixedQueue.length === 0 ) {
            break;
        }
        const scanner0 = fixedQueue.pop();
        unfixedQueue = unfixedQueue.filter( (scanner2, i) => {
            // for each point in scanner 0, check its distance map against the distances of every point in scanner2
            return !scanner0.find( point => {
                return scanner2.find( point2 => {
                    // use only 8 digits of precision when comparing to conquer rounding differences
                    const intersection = intersectionBy( point.distances, point2.distances, ds => round8(ds.distance) );
                    if ( intersection.length >= 11 ) {
                        // scanner 0 shares at least 12 common points with scanner i.

                        // get two points in the intersection belonging to scanner 0, and the equivalent two points belonging to scanner i
                        const scanner0Points = intersection.slice( 0, 2 );
                        const scannerIPoints = scanner0Points.map(
                            scanner0p => point2.distances.find( p => round8(p.distance) === round8(scanner0p.distance) ).point
                        );
                        // compare the two points to find out how scanner i's beacon cloud is rotated
                        const rotate = findRotation(
                            scanner0Points[1].point.minus( scanner0Points[0].point ),
                            scannerIPoints[1].minus( scannerIPoints[0] )
                        );
                        // find the offset between scanner 0 and scanner i
                        const offset = scanner0Points[0].point.minus( rotate(scannerIPoints[0]) );
                        // change all points in this scanner to be in the first scanner's coordinate system
                        scanner2.forEach( p => Object.assign(p, rotate(p).plus(offset)) );
                        // record the location of the scanner itself with respect to scanner 0
                        scannerLocations.push( rotate(new XYZ([0,0,0])).plus(offset) );
                        
                        fixedQueue.unshift( scanner2 );
                        return true;
                    }
                });
            });
        });
    }
    return { beacons, scannerLocations };
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => new Set( buildBeaconMap(input).beacons.map(
        scanner => scanner.map( p => p.toString() )
    ).flat() ).size,
    // function that solves part 2
    ( input: string ) => Math.max(
        ...buildBeaconMap( input ).scannerLocations.map(
            ( scanner, i, scanners ) => scanners.map( scanner2 => scanner.taxicabDistanceTo(scanner2) )
        ).flat()
    )
);
