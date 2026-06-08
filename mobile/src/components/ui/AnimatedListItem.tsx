import { PropsWithChildren } from 'react';
import Animated, {
  FadeInDown,
  FadeOutLeft,
  LinearTransition,
} from 'react-native-reanimated';

type Props = PropsWithChildren<{
  index?: number;
}>;

export function AnimatedListItem({ children, index = 0 }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60)
        .springify()
        .damping(18)}
      exiting={FadeOutLeft.duration(260)}
      layout={LinearTransition.springify().damping(20)}
    >
      {children}
    </Animated.View>
  );
}
