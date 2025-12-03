import { Package } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CarrierLogoProps {
    carrier: string;
    className?: string;
}

const carrierDomains: Record<string, string> = {
    'Amazon': 'amazon.com',
    'Mercado Libre': 'mercadolibre.com',
    'DHL': 'dhl.com',
    'J&T': 'jtexpress.mx',
    'Estafeta': 'estafeta.com',
    'UPS': 'ups.com',
    'FedEx': 'fedex.com',
    'Correos de México': 'correosdemexico.gob.mx'
};

export function CarrierLogo({ carrier, className = "h-6 w-6 rounded-full bg-white" }: CarrierLogoProps) {
    const [error, setError] = useState(false);
    const domain = carrierDomains[carrier];

    // Reset error state when carrier changes
    useEffect(() => {
        setError(false);
    }, [carrier]);

    if (!domain || error) {
        return (
            <div className={`${className} flex items-center justify-center bg-slate-100 dark:bg-slate-800`}>
                <Package className="h-1/2 w-1/2 text-slate-500 dark:text-slate-400" />
            </div>
        );
    }

    return (
        <img
            src={`https://logo.clearbit.com/${domain}`}
            alt={carrier}
            className={`${className} ${className.includes('object-') ? '' : 'object-contain'}`}
            onError={() => setError(true)}
        />
    );
}
