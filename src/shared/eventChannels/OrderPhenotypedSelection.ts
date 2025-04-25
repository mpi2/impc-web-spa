import { eventbus } from '../eventbus';

export const orderPhenotypedSelectionChannel = eventbus<{
  onAlleleSelected: (payload: string) => void;
}>();