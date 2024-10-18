import { Crypto } from "./cryptoUtils.js";
import { BaseConverter } from "./baseConverter.js";

export class UID {
    static base = 62;
    /**
     * Genera i prefissi c1 e c2 da usare nella generazione dell uid
     * @param {number} size dimensione in byte del numero casuale finale
     * @returns {string} - numero casuale in formato base 36
     */
    static random_c(size) {
        const random_bytes = Crypto.random_bytes(size);
        // ---
        let random_number = 0n;
        for (let i = 0; i < size; i++) {
            random_number |= BigInt(random_bytes[i]) << BigInt(i * 8);
        }
        // ---
        return BaseConverter.to_string(Number(random_number), this.base);
    }
    /**
     * Genera un identificatore unico con formato c1-t-c2
     * dove c1 e c2 sono le parti casuali, mentre t è il tempo in ms
     * il generatore lavora con numeri in base 36
     * @param {number} [byte_size=3] - Dimensione in byte delle parti casuali c1 e c2
     * @returns {string} - l'identificatore univoco
     */
    static genera(byte_size = 4) {
        if (byte_size < 2 || byte_size > 5) throw new Error("Dimensione eccessiva");
        
        // ---
        const timestamp = BaseConverter.to_string(Date.now(), this.base);
        // ---
        const c1 = this.random_c(byte_size);
        const c2 = this.random_c(byte_size);
        // ---
        return `${c1}-${timestamp}-${c2}`;
    }
}