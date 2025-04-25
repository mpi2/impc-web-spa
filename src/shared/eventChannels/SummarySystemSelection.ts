import { eventbus } from '../eventbus';

export const summarySystemSelectionChannel = eventbus<{
  onSystemSelection: (payload: string) => void;
}>();