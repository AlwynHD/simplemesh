// types/simplify-triangles.d.ts

declare module 'simplify-triangles' {
    // Define the types used by the library's function(s)
    // You might already have these types defined elsewhere,
    // but it's good practice to define them here for the module's contract.
    type Vertex = [number, number, number];
    type Triangle = [Vertex, Vertex, Vertex];
  
    /**
     * Simplifies a mesh represented by an array of triangles using
     * Quadratic Error Mesh Decimation.
     *
     * @param triangles - An array where each element is a triangle.
     *   Each triangle is an array of 3 vertices `[v1, v2, v3]`.
     *   Each vertex is an array of 3 numbers `[x, y, z]`.
     * @param factor - The target simplification ratio (0.0 to 1.0).
     *   For example, 0.25 means the target is 25% of the original triangle count.
     *   The actual resulting count may differ slightly.
     * @returns A new array of triangles representing the simplified mesh,
     *   in the same format as the input.
     */
    export function simplify(triangles: Triangle[], factor: number): Triangle[];
  
    // If the library exported other functions or values, declare them here too.
    // export const someOtherExport: SomeType;
  }