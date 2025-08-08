import {
    HorizontalRayLine,
    HorizontalSegment,
    HorizontalStraightLine,
    VerticalRayLine,
    VerticalSegment,
    VerticalStraightLine,
    RayLine,
    Segment,
    StraightLine,
    PriceLine
} from '@/components/svg/line'

// 加别的语言(*_*)
export const LineTypes = [
    'horizontalRayLine',
    'horizontalSegment',
    'horizontalStraightLine',
    'verticalRayLine',
    'verticalSegment',
    'verticalStraightLine',
    'rayLine',
    'segment',
    'straightLine',
    'priceLine',
]

export type ToolMapType = { [key: string]: React.FC };

export const ToolMap : ToolMapType = {
    'horizontalRayLine': HorizontalRayLine,
    'horizontalSegment': HorizontalSegment,
    'horizontalStraightLine': HorizontalStraightLine,
    'verticalRayLine': VerticalRayLine,
    'verticalSegment': VerticalSegment,
    'verticalStraightLine': VerticalStraightLine,
    'rayLine': RayLine,
    'segment': Segment,
    'straightLine': StraightLine,
    'priceLine': PriceLine,
    // 'priceChannelLine': 'priceChannelLine',
    // 'parallelStraightLine': 'parallelStraightLine',
    // 'fibonacciLine': 'fibonacciLine',
    // 'simpleAnnotation': 'simpleAnnotation',
    // 'simpleTag': 'simpleTag',
}