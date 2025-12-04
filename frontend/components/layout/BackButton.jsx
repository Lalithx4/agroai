'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    return (
        <Link href="/" className="back-btn" aria-label="Go back">
            <ArrowLeft size={20} strokeWidth={2} />
        </Link>
    );
}
