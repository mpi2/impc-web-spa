import { eventbus } from '../eventbus';

export const chartLoadingIndicatorChannel = eventbus<{
  toggleIndicator: (payload: boolean) => void;
}>();