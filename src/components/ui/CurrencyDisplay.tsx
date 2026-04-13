import { useEffect, useRef, useState } from 'react';
import { Coins, Gem } from 'lucide-react';

interface CurrencyDisplayProps {
    type: 'coin' | 'diamond';
    value: number;
    variant?: 'compact' | 'detailed';
    label?: string;
    className?: string;
}

export function CurrencyDisplay({
    type,
    value,
    variant = 'compact',
    label,
    className = '',
}: CurrencyDisplayProps) {
    const [animate, setAnimate] = useState(false);
    const prevValue = useRef(value);

    useEffect(() => {
        if (value !== prevValue.current) {
            setAnimate(true);
            prevValue.current = value;
            const t = setTimeout(() => setAnimate(false), 600);
            return () => clearTimeout(t);
        }
    }, [value]);

    const isCoin = type === 'coin';

    if (variant === 'detailed') {
        return (
            <div className={`currency-display-detailed ${isCoin ? 'currency-coin-bg' : 'currency-diamond-bg'} ${animate ? 'currency-bounce' : ''} ${className}`}>
                <div className={`currency-display-icon ${isCoin ? 'currency-coin-icon' : 'currency-diamond-icon'}`}>
                    {isCoin ? <Coins className="w-4 h-4" /> : <Gem className="w-4 h-4" />}
                </div>
                <div className="currency-display-info">
                    <span className="currency-display-value">{value.toLocaleString()}</span>
                    {label && <span className="currency-display-label">{label}</span>}
                </div>
            </div>
        );
    }

    return (
        <div className={`currency-display-compact ${isCoin ? 'currency-coin-compact' : 'currency-diamond-compact'} ${animate ? 'currency-bounce' : ''} ${className}`}>
            <div className={`currency-display-icon-sm ${isCoin ? 'currency-coin-icon' : 'currency-diamond-icon'}`}>
                {isCoin ? <Coins className="w-3.5 h-3.5" /> : <Gem className="w-3.5 h-3.5" />}
            </div>
            <span className="currency-display-val">{value.toLocaleString()}</span>
        </div>
    );
}

interface CurrencyPairProps {
    coins: number;
    diamonds: number;
    variant?: 'compact' | 'detailed';
    coinLabel?: string;
    diamondLabel?: string;
    className?: string;
}

export function CurrencyPair({
    coins,
    diamonds,
    variant = 'compact',
    coinLabel,
    diamondLabel,
    className = '',
}: CurrencyPairProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <CurrencyDisplay type="coin" value={coins} variant={variant} label={coinLabel} />
            <CurrencyDisplay type="diamond" value={diamonds} variant={variant} label={diamondLabel} />
        </div>
    );
}
