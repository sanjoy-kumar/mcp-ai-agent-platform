import path from 'path';

const ALLOWED_DIR = path.resolve("./data");

export function getSafePath(filename) {
    const resolved = path.resolve(ALLOWED_DIR, filename);

    if (!resolved.startsWith(ALLOWED_DIR)) {
        throw new Error("Access denied");
    }

    return resolved;
}
