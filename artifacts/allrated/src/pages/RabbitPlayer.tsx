import BingrWatch from '@/pages/BingrWatch';

/**
 * RabbitRip's canonical player entrypoint.
 *
 * The legacy BingrWatch implementation remains behind this boundary while
 * streaming resolution is provider-agnostic. New player work should target
 * RabbitPlayer rather than adding provider-specific player components.
 */
export default function RabbitPlayer() {
  return <BingrWatch />;
}
