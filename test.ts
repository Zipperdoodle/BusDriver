// Quick test to verify PointToLineDistanceMapper.
// To run the test, use: deno test test.ts



import { assertEquals } from "https://deno.land/std@0.114.0/testing/asserts.ts";



interface Coordinates {
    mX: number;
    mY: number;
};



function Clamp(aValue: number, aMinimum: number, aMaximum: number): number {
    return Math.min(Math.max(aValue, aMinimum), aMaximum);
};



function PointToLineDistanceMapper(aPoint: Coordinates) {
    return (aLineStart: Coordinates, aLineEnd: Coordinates): number => {
        const lDistStartToEndSquared: number = Math.pow(aLineEnd.mX - aLineStart.mX, 2) + Math.pow(aLineEnd.mY - aLineStart.mY, 2);

        // If the line segment is actually a point, return distance between the points
        if (lDistStartToEndSquared === 0) return Math.hypot(aPoint.mX - aLineStart.mX, aPoint.mY - aLineStart.mY);

        // Consider the line extending the segment, parameterized as lineStart + t (lineEnd - lineStart).
        // We find the projection of "point" onto the line. 
        // It falls where t = [(point-lineStart) . (lineEnd-lineStart)] / |lineEnd-lineStart|^2
        let lProjectionFactor: number = ((aPoint.mX - aLineStart.mX) * (aLineEnd.mX - aLineStart.mX) + (aPoint.mY - aLineStart.mY) * (aLineEnd.mY - aLineStart.mY)) / lDistStartToEndSquared;
        // lProjectionFactor = Math.max(0, Math.min(1, lProjectionFactor)); // We clamp t from [0,1] to handle points outside the segment vw.
        lProjectionFactor = Clamp(lProjectionFactor, 0, 1);

        // Projection falls on the segment
        const lProjection: Coordinates = {
            mX: aLineStart.mX + lProjectionFactor * (aLineEnd.mX - aLineStart.mX),
            mY: aLineStart.mY + lProjectionFactor * (aLineEnd.mY - aLineStart.mY),
        };

        return Math.hypot(aPoint.mX - lProjection.mX, aPoint.mY - lProjection.mY); // return the distance between the point and its projection
    };
};




Deno.test("Distance to line is zero when point is on the line", () => {
    const lTestPoint: Coordinates = { mX: 1, mY: 1 };
    const lLineStart: Coordinates = { mX: 0, mY: 0 };
    const lLineEnd: Coordinates = { mX: 2, mY: 2 };
    const lCalculateDistance = PointToLineDistanceMapper(lTestPoint);
    const lResult: number = lCalculateDistance(lLineStart, lLineEnd);
    assertEquals(lResult, 0);
});

Deno.test("Distance to point when line is a point", () => {
    const lTestPoint: Coordinates = { mX: 1, mY: 1 };
    const lLinePoint: Coordinates = { mX: 2, mY: 2 };
    const lCalculateDistance = PointToLineDistanceMapper(lTestPoint);
    const lResult: number = lCalculateDistance(lLinePoint, lLinePoint);
    assertEquals(lResult, Math.sqrt(2));
});

Deno.test("Distance to line segment in 2D space", () => {
    const lTestPoint: Coordinates = { mX: 0, mY: 1 };
    const lLineStart: Coordinates = { mX: -1, mY: 0 };
    const lLineEnd: Coordinates = { mX: 1, mY: 0 };
    const lCalculateDistance = PointToLineDistanceMapper(lTestPoint);
    const lResult: number = lCalculateDistance(lLineStart, lLineEnd);
    assertEquals(lResult, 1);
});
