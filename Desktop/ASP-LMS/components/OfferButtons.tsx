'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AcceptOfferButton({ status }: { status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/student/offer/accept', {
        method: 'POST',
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
    >
      {loading ? 'Принятие...' : 'Принять офер'}
    </button>
  );
}

export function DeclineOfferButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDecline = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/student/offer/decline', {
        method: 'POST',
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error declining offer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDecline}
      disabled={loading}
      className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
    >
      {loading ? 'Отклонение...' : 'Отказаться'}
    </button>
  );
}

