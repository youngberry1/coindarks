import { customAlphabet } from 'nanoid';

// Custom alphabet for readability (no O, 0, I, l)
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
const nanoid = customAlphabet(alphabet, 6);

export function generateOrderId(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Format: CD-240105-XK9P2M
    return `CD-${year}${month}${day}-${nanoid()}`;
}
