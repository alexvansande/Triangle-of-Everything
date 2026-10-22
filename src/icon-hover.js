import {easeCubicOut} from 'd3';

export const ICON_HOVER_MS = 240;
export const iconHoverEase = easeCubicOut;

// One clock for size, backing and depth. Read the current growth when reversing
// so rapid enter/leave events never jump back to an endpoint.
export function animateIconGrowth(group, target, paint, reducedMotion=false) {
  group.interrupt('icon-hover');
  const render = (node, growth) => {
    node.__iconGrowth = growth;
    paint(node, growth);
  };
  if (reducedMotion) { group.each(function(){render(this,target)}); return; }
  group.transition('icon-hover').duration(ICON_HOVER_MS).ease(iconHoverEase)
    .tween('growth',function(){
      const node=this, from=node.__iconGrowth??1;
      return t=>render(node,from+(target-from)*t);
    });
}
