// Every animated file in this project imports gsap from here instead of from
// "gsap" directly, for two reasons:
//
// 1. One import = one copy of GSAP. If two files pull GSAP in separately you
//    can end up with two instances that don't know about each other, and
//    animations from one silently fail to control elements animated by another.
//
// 2. Plugins are registered ONCE here, at the top level, before anything runs.
//    ScrollTrigger and Observer are plugins: extra tools that GSAP needs to
//    know about before you can use them. Forgetting to register one is the
//    reason a scroll animation sometimes just does nothing, with no error.
//    Registering in one place means no file depends on some other file having
//    been imported first.
import gsap from "gsap";
import { Observer, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger, Observer);

export { gsap, ScrollTrigger, Observer };
