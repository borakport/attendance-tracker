'use client';

import React from 'react';
import InfrastructureDemo from '@/components/InfrastructureDemo';
import { PageErrorBoundary } from '@/components/ErrorBoundary';

export default function DemoPage() {
  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <InfrastructureDemo />
      </div>
    </PageErrorBoundary>
  );
}
