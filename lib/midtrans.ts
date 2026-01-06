/**
 * Midtrans Snap Client Configuration
 * Uses Midtrans Snap API for seamless payment integration
 */
import crypto from 'crypto';
export interface MidtransConfig {
    serverKey: string;
    clientKey: string;
    isProduction: boolean;
}

export interface TransactionDetails {
    orderId: string;
    grossAmount: number;
}

export interface CustomerDetails {
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
}

export interface ItemDetails {
    id: string;
    price: number;
    quantity: number;
    name: string;
}

export interface SnapTransactionRequest {
    transaction_details: {
        order_id: string;
        gross_amount: number;
    };
    customer_details?: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
    };
    item_details?: Array<{
        id: string;
        price: number;
        quantity: number;
        name: string;
    }>;
    enabled_payments?: string[];
    credit_card?: {
        secure: boolean;
    };
}

export interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
}

// Get configuration from environment
export function getMidtransConfig(): MidtransConfig {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

    if (!serverKey || !clientKey) {
        throw new Error('Midtrans credentials not configured');
    }

    return { serverKey, clientKey, isProduction };
}

// Get base URL based on environment
export function getMidtransBaseUrl(isProduction: boolean): string {
    return isProduction
        ? 'https://app.midtrans.com'
        : 'https://app.sandbox.midtrans.com';
}

// Get API base URL
export function getMidtransApiUrl(isProduction: boolean): string {
    return isProduction
        ? 'https://api.midtrans.com'
        : 'https://api.sandbox.midtrans.com';
}

/**
 * Create Snap transaction token
 */
export async function createSnapTransaction(
    request: SnapTransactionRequest
): Promise<SnapTransactionResponse> {
    const config = getMidtransConfig();
    const apiUrl = getMidtransApiUrl(config.isProduction);

    // Default enabled payments: QRIS, Bank Transfer, GoPay, ShopeePay, Credit Card
    const enabledPayments = request.enabled_payments ?? [
        'credit_card',
        'gopay',
        'shopeepay',
        'qris',
        'bank_transfer',
        'bca_va',
        'bni_va',
        'bri_va',
        'permata_va',
        'other_va',
    ];

    const payload: SnapTransactionRequest = {
        ...request,
        enabled_payments: enabledPayments,
        credit_card: {
            secure: true,
        },
    };

    const authString = Buffer.from(`${config.serverKey}:`).toString('base64');

    const response = await fetch(`${apiUrl}/snap/v1/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${authString}`,
            'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Midtrans API error:', errorBody);
        throw new Error(`Midtrans API error: ${response.status}`);
    }

    const data = await response.json();
    return data as SnapTransactionResponse;
}

/**
 * Verify Midtrans webhook signature
 */
export function verifyWebhookSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string
): boolean {
    const config = getMidtransConfig();

    // Create SHA512 hash of order_id + status_code + gross_amount + server_key
    const payload = `${orderId}${statusCode}${grossAmount}${config.serverKey}`;
    const hash = crypto.createHash('sha512').update(payload).digest('hex');

    return hash === signatureKey;
}

/**
 * Get transaction status from Midtrans
 */
export async function getTransactionStatus(orderId: string): Promise<Record<string, unknown>> {
    const config = getMidtransConfig();
    const apiUrl = getMidtransApiUrl(config.isProduction);
    const authString = Buffer.from(`${config.serverKey}:`).toString('base64');

    const response = await fetch(`${apiUrl}/v2/${orderId}/status`, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${authString}`,
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get transaction status: ${response.status}`);
    }

    return response.json();
}
