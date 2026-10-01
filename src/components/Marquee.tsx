import { Icon } from "@iconify/react";
import { gsap, Observer } from "../lib/gsap";
import { useEffect, useRef, type ReactNode } from "react";

interface MarqueeProps {
  items: string[];
  className?: string;
  icon?: string;
  iconClassName?: string;
  // Per-item wrapper. Defaults to the word-strip layout; override it when the
  // items are images rather than words, where 64px of padding either side and a
  // 32rem separator gap are far too much air.
  itemClassName?: string;
  // Replaces the default `{text} <Icon />` content of one item. Takes the item
  // string, so the same `items` array can be rendered any way. Rendered content
  // may be an inline arrow - unlike `items` it is not a dependency of the effect
  // below, so a new function identity each render does not rebuild the loop.
  renderItem?: (item: string, index: number) => ReactNode;
  reverse?: boolean;
}

// Options accepted by horizontalLoop below.
interface LoopConfig {
  repeat?: number;
  paused?: boolean;
  speed?: number;
  snap?: number | false;
  paddingRight?: number | string;
  reversed?: boolean;
}

// A normal GSAP timeline plus the extra helpers horizontalLoop attaches to it.
type LoopTimeline = gsap.core.Timeline & {
  next: (vars?: gsap.TweenVars) => gsap.core.Tween;
  previous: (vars?: gsap.TweenVars) => gsap.core.Tween;
  current: () => number;
  toIndex: (index: number, vars?: gsap.TweenVars) => gsap.core.Tween;
  times: number[];
};

const Marquee = ({
  items,
  className = "text-white bg-black",
  icon = "mdi:star-four-points",
  iconClassName = "",
  itemClassName = "flex items-center px-16 gap-x-32",
  renderItem,
  reverse = false,
}: MarqueeProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<(HTMLSpanElement | null)[]>([]);

  // This whole function is copied from a GSAP example. It builds one long
  // timeline that slides the text left forever, and when an item leaves on the
  // left it instantly jumps back to the right end. The jump happens while it's
  // off screen, so you never see it. That's what makes the loop seamless.
  // You don't need to understand the maths to use it. Just call it with your
  // items (see the useEffect below). The two options worth knowing:
  //   speed: 1 = normal speed, 2 = twice as fast
  //   paddingRight: the gap in pixels between the end and the start
  function horizontalLoop(
    itemsInput: (HTMLElement | null)[],
    config: LoopConfig = {},
  ): LoopTimeline {
    const items = gsap.utils.toArray<HTMLElement>(itemsInput);
    const tl = gsap.timeline({
      repeat: config.repeat,
      paused: config.paused,
      defaults: { ease: "none" },
      onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100),
    }) as LoopTimeline;
    const length = items.length;
    const startX = items[0].offsetLeft;
    const times: number[] = [];
    const widths: number[] = [];
    const xPercents: number[] = [];
    let curIndex = 0;
    const pixelsPerSecond = (config.speed || 1) * 100;
    const snap: (v: number) => number =
      config.snap === false
        ? (v: number) => v
        : gsap.utils.snap(config.snap || 1); // some browsers shift by a pixel to accommodate flex layouts, so for example if width is 20% the first element's width might be 242px, and the next 243px, alternating back and forth. So we snap to 5 percentage points to make things look more natural
    let curX: number;
    let distanceToStart: number;
    let distanceToLoop: number;
    let item: HTMLElement;
    let i: number;
    gsap.set(items, {
      // convert "x" to "xPercent" to make things responsive, and populate the widths/xPercents Arrays to make lookups faster.
      xPercent: (i: number, el: Element) => {
        const w = (widths[i] = parseFloat(
          String(gsap.getProperty(el, "width", "px")),
        ));
        xPercents[i] = snap(
          (parseFloat(String(gsap.getProperty(el, "x", "px"))) / w) * 100 +
            Number(gsap.getProperty(el, "xPercent")),
        );
        return xPercents[i];
      },
    });
    gsap.set(items, { x: 0 });
    const totalWidth =
      items[length - 1].offsetLeft +
      (xPercents[length - 1] / 100) * widths[length - 1] -
      startX +
      items[length - 1].offsetWidth *
        Number(gsap.getProperty(items[length - 1], "scaleX")) +
      (parseFloat(String(config.paddingRight)) || 0);
    for (i = 0; i < length; i++) {
      item = items[i];
      curX = (xPercents[i] / 100) * widths[i];
      distanceToStart = item.offsetLeft + curX - startX;
      distanceToLoop =
        distanceToStart + widths[i] * Number(gsap.getProperty(item, "scaleX"));
      tl.to(
        item,
        {
          xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
          duration: distanceToLoop / pixelsPerSecond,
        },
        0,
      )
        .fromTo(
          item,
          {
            xPercent: snap(
              ((curX - distanceToLoop + totalWidth) / widths[i]) * 100,
            ),
          },
          {
            xPercent: xPercents[i],
            duration:
              (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
            immediateRender: false,
          },
          distanceToLoop / pixelsPerSecond,
        )
        .add("label" + i, distanceToStart / pixelsPerSecond);
      times[i] = distanceToStart / pixelsPerSecond;
    }
    function toIndex(index: number, vars: gsap.TweenVars = {}) {
      if (Math.abs(index - curIndex) > length / 2) {
        // always go in the shortest direction
        index += index > curIndex ? -length : length;
      }
      const newIndex = gsap.utils.wrap(0, length, index);
      let time = times[newIndex];
      if (time > tl.time() !== index > curIndex) {
        // if we're wrapping the timeline's playhead, make the proper adjustments
        vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      curIndex = newIndex;
      vars.overwrite = true;
      return tl.tweenTo(time, vars);
    }
    // The parameter types are written out because gsap.core.Timeline carries a
    // `[key: string]: any` index signature, so the properties added above are
    // `any` as far as inference is concerned and the arrow parameters would
    // otherwise have no contextual type to come from.
    tl.next = (vars?: gsap.TweenVars) => toIndex(curIndex + 1, vars);
    tl.previous = (vars?: gsap.TweenVars) => toIndex(curIndex - 1, vars);
    tl.current = () => curIndex;
    tl.toIndex = (index: number, vars?: gsap.TweenVars) => toIndex(index, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true); // pre-render for performance
    if (config.reversed) {
      tl.vars.onReverseComplete?.();
      tl.reverse();
    }
    return tl;
  }

  useEffect(() => {
    // Builds the loop that actually moves the text. reverse: true starts it
    // travelling the other way (used by the bottom band on ContactSummary).
    const tl = horizontalLoop(itemsRef.current, {
      repeat: -1, // -1 = loop forever
      paddingRight: 30,
      reversed: reverse,
    });

    // This makes the marquee react to HOW FAST you scroll, not just where you
    // are. Observer watches the scroll and tells us the speed, then we speed
    // the loop up or slow it down: scroll the same way the text is moving and
    // it speeds up, scroll the other way and it turns around.
    // Two steps on purpose: speed up quickly, then 0.3s later ease back down
    // to a gentle drift. Doing it in one go feels jerky.
    // NOTE: Observer is a separate plugin, like ScrollTrigger, and it has to be
    // registered before use (done in src/lib/gsap.ts). GSAP also does NOT clean
    // it up for us when the component unmounts, so we kill it ourselves below.
    const observer = Observer.create({
      onChangeY(self) {
        let factor = 2.5;
        if ((!reverse && self.deltaY < 0) || (reverse && self.deltaY > 0)) {
          factor *= -1;
        }
        gsap
          .timeline({
            defaults: {
              ease: "none",
            },
          })
          .to(tl, { timeScale: factor * 2.5, duration: 0.2, overwrite: true })
          .to(tl, { timeScale: factor / 2.5, duration: 1 }, "+=0.3");
      },
    });

    return () => {
      observer.kill(); // without this, every remount leaves one behind
      tl.kill();
    };
  }, [items, reverse]);
  return (
    <div
      ref={containerRef}
      className={`overflow-hidden w-full h-20 md:h-25 flex items-center marquee-text-responsive font-light uppercase whitespace-nowrap ${className}`}
    >
      <div className="flex">
        {items.map((text, index) => (
          <span
            key={index}
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
            className={itemClassName}
          >
            {renderItem ? (
              renderItem(text, index)
            ) : (
              <>
                {text} <Icon icon={icon} className={iconClassName} />
              </>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
