import { Turtle, SimpleTurtle, Point, Color } from "./turtle";
import * as fs from "fs";
import { execSync } from "child_process";

/**
 * Draws a polygon of a specified number of sides with equal side lengths.
 * @param turtle The turtle to use for drawing.
 * @param sideLength The length of each side of the polygon.
 * @param numSides Number of sides for the polygon.
 */
export function drawPolygon(turtle: Turtle, sideLength: number, numSides: number): void {
    const anglePerTurn = 360 / numSides;
    for (let i = 0; i < numSides; i++) {
        turtle.forward(sideLength);
        turtle.turn(anglePerTurn);
    }
}

/**
 * Calculates the length of a chord using the given angle and radius.
 * Uses the sine law to compute chord length precisely.
 * @param radius Radius of the circle.
 * @param angleInDegrees Angle subtended by the chord at the center.
 * @returns Precise chord length.
 */
export function calculateChordLength(radius: number, angleInDegrees: number): number {
    const halfAngle = angleInDegrees / 2;
    const radians = (halfAngle * Math.PI) / 180;
    return Math.round(2 * radius * Math.sin(radians) * 1000000) / 1000000;
}

/**
 * Renders a spiral-like circle approximation using variable side lengths.
 * @param turtle The turtle to use.
 * @param radius The base radius of the spiral.
 * @param iterations Number of spiral iterations.
 */
export function drawSpiralingCircle(
    turtle: Turtle,
    radius: number,
    iterations: number
): void {
    const baseAngle = 360 / iterations;
    let currentRadius = radius;

    for (let i = 0; i < iterations; i++) {
        const chordLength = calculateChordLength(currentRadius, baseAngle);
        turtle.forward(chordLength);
        turtle.turn(baseAngle);

        // Gradually increase spiral radius
        currentRadius *= 1.05;
    }
}

/**
 * Computes Euclidean distance between two points with enhanced precision.
 * @param point1 First coordinate point.
 * @param point2 Second coordinate point.
 * @returns Precise distance between points.
 */
export function computeDistance(point1: Point, point2: Point): number {
    const xDiff = point1.x - point2.x;
    const yDiff = point1.y - point2.y;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

/**
 * Generates an optimal path connecting given points with minimal turns.
 * @param turtle Turtle object for navigation.
 * @param pointSequence Array of points to traverse.
 * @returns Detailed path navigation instructions.
 */
export function plotOptimalPath(turtle: Turtle, pointSequence: Point[]): string[] {
    const navigationInstructions: string[] = [];

    for (let i = 0; i < pointSequence.length - 1; i++) {
        const currentPoint = pointSequence[i];
        const nextPoint = pointSequence[i + 1];

        const deltaX = nextPoint.x - currentPoint.x;
        const deltaY = nextPoint.y - currentPoint.y;

        const travelAngle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        const travelDistance = computeDistance(currentPoint, nextPoint);

        const turnAngle = travelAngle - turtle.getHeading();
        turtle.turn(turnAngle);
        turtle.forward(travelDistance);

        navigationInstructions.push(`Turn ${turnAngle.toFixed(2)} degrees`);
        navigationInstructions.push(`Move ${travelDistance.toFixed(2)} units`);
    }

    return navigationInstructions;
}

/**
 * Creates an abstract geometric art piece with dynamic color transitions.
 * @param turtle Turtle used for artistic rendering.
 */
export function createGeometricArtwork(turtle: Turtle): void {
    const colorPalette: Color[] = [
        "teal", "coral", "indigo", "gold",
        "crimson", "navy", "olive", "maroon"
    ];

    // Fractal-like geometric pattern
    for (let complexity = 1; complexity <= 5; complexity++) {
        turtle.color(colorPalette[(complexity * 2) % colorPalette.length]);

        for (let i = 3; i <= 8; i++) {
            drawPolygon(turtle, 50 / complexity, i);
            turtle.turn(360 / (i * complexity));
        }
    }
}

function renderSVGVisualization(
    pathData: { start: Point; end: Point; color: Color }[]
): string {
    const canvasWidth = 600;
    const canvasHeight = 600;
    const scaleFactor = 0.8;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const pathElements = pathData.map(segment => {
        const x1 = segment.start.x * scaleFactor + centerX;
        const y1 = segment.start.y * scaleFactor + centerY;
        const x2 = segment.end.x * scaleFactor + centerX;
        const y2 = segment.end.y * scaleFactor + centerY;

        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
            stroke="${segment.color}" stroke-width="2" stroke-opacity="0.7"/>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html>
<head>
    <title>Geometric Turtle Graphics</title>
    <style>
        body { background-color: #f4f4f4; display: flex; justify-content: center; }
        svg { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <svg width="${canvasWidth}" height="${canvasHeight}">
        ${pathElements}
    </svg>
</body>
</html>`;
}

function exportVisualization(htmlContent: string, filename: string = "turtle_art.html"): void {
    fs.writeFileSync(filename, htmlContent);
    console.log(`Visualization exported to ${filename}`);
}

export function main(): void {
    const turtle = new SimpleTurtle();

    // Demonstrate various turtle graphics techniques
    createGeometricArtwork(turtle);

    const pointsToExplore: Point[] = [
        { x: 10, y: 10 },
        { x: 100, y: 50 },
        { x: 200, y: 150 }
    ];

    const navigationPath = plotOptimalPath(turtle, pointsToExplore);
    console.log("Navigation Path Details:", navigationPath);

    const svgVisualization = renderSVGVisualization((turtle as SimpleTurtle).getPath());
    exportVisualization(svgVisualization);
}

if (require.main === module) {
    main();
}