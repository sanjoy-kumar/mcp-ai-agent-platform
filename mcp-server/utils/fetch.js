export async function safeFetch(url, timeout = 10000) {
    try {
        const res = await fetch(url, {
            signal: AbortSignal.timeout(timeout)
        });

        if (!res.ok) {
            throw new Error(`HTTP Error: ${res.status}`);
        }

        return await res.json();
    } catch (err) {
        if (err.name === 'TimeoutError') {
            throw new Error(`Request to ${url} timed out after ${timeout}ms`);
        }
        throw err;
    }
}
