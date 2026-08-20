import { useRabbitSources } from '@/hooks/useRabbitSources';

/** @deprecated Use useRabbitSources. Kept as a compatibility facade during the RabbitRip player migration. */
export const useBingrSources = useRabbitSources;
export type { RabbitSource as BingrSource, RabbitSubtitle as BingrSubtitle } from '@/hooks/useRabbitSources';
