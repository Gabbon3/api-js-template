import crypto from 'crypto';

export class Crypto {
    /**
     * Genera una serie di byte casuali crittograficamente sicuri
     * @param {number} size numero di byte da generare casualmente del
     * @param {string} [encoding='hex'] - Formato della chiave: 'hex' o 'base64'
     * @returns {string} byte generati
     */
    static random_bytes(size, encoding = 'hex') {
        return crypto.randomBytes(size).toString(encoding);
    }
    /**
     * Genera un hash HMAC di un messaggio con una chiave specifica.
     * @param {string} message - Messaggio da crittografare.
     * @param {Buffer|string} key - Chiave segreta per l'HMAC; può essere una stringa o un buffer.
     * @param {Object} [options={}] - Opzioni per configurare l'HMAC.
     * @param {string} [options.key_encoding] - Encoding della chiave, se fornita come stringa (es: 'hex' o 'base64'). Se non specificato, si assume che `key` sia già un `Buffer`.
     * @param {string} [options.algo='sha256'] - Algoritmo di hash da usare per l'HMAC (es: 'sha256').
     * @param {string} [options.output_encoding='hex'] - Encoding per l'output HMAC, default 'hex'.
     * @returns {string} HMAC del messaggio in formato specificato.
     */
    static hmac(message, key, options = {}) {
        const key_buffer = options.key_encoding ? Buffer.from(key, options.key_encoding) : key;
        // ---
        return crypto.createHmac(options.algo ?? 'sha256', key_buffer)
                    .update(message)
                    .digest(options.output_encoding ?? 'hex');
    }
    /**
     * Calcola l'hash di un messaggio.
     * @param {string} message - Messaggio da hashare.
     * @param {Object} [options={}] - Opzioni per configurare l'hash.
     * @param {string} [options.algorithm='sha256'] - Algoritmo di hash da usare (es: 'sha256').
     * @param {string} [options.encoding='hex'] - Encoding per l'output hash, default 'hex'.
     * @returns {string} Hash del messaggio in formato specificato.
     */
    static hash(message, options = {}) {
        return crypto.createHash(options.algorithm ?? 'sha256')
                    .update(message)
                    .digest(options.encoding ?? 'hex');
    }
}