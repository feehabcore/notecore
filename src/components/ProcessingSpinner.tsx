import * as React from 'react';
import { ChaoticOrbit } from 'ldrs/react';
import 'ldrs/react/ChaoticOrbit.css';

export default function ProcessingSpinner({
  size = 20,
  color = 'currentColor',
}: {
  size?: number;
  color?: string;
}) {
  return <ChaoticOrbit size={String(size)} speed="1.5" color={color} />;
}

