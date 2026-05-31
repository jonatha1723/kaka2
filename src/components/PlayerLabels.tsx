import React, { forwardRef } from 'react';

const PlayerLabels = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      className="absolute inset-0 pointer-events-none overflow-hidden z-20"
    />
  );
});

PlayerLabels.displayName = 'PlayerLabels';

export default PlayerLabels;
