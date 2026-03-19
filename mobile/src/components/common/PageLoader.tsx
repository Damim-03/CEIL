// src/components/common/PageLoader.tsx
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useEffect, useRef, useState } from "react";

const { width: SW } = Dimensions.get("window");

const TEAL = "#2B6F5E";
const GOLD = "#C4A035";

// ─────────────────────────────────────────────
// Soft glow — multiple semi-transparent circles
// ─────────────────────────────────────────────

function GlowCircle({
  size,
  color,
  opacity,
}: {
  size: number;
  color: string;
  opacity: Animated.AnimatedInterpolation<number> | Animated.Value;
}) {
  // Simulate radial gradient with concentric circles
  const layers = [1, 0.6, 0.3, 0.12, 0.04];
  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      {layers.map((alpha, i) => {
        const s = size * (1 - i * 0.16);
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              width: s,
              height: s,
              borderRadius: s / 2,
              backgroundColor: color,
              opacity: alpha * 0.18,
            }}
          />
        );
      })}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────
// Ripple ring
// ─────────────────────────────────────────────

function Ring({
  size,
  color,
  delay,
}: {
  size: number;
  color: string;
  delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 0.8,
        borderColor: color,
        opacity: anim.interpolate({
          inputRange: [0, 0.1, 0.75, 1],
          outputRange: [0, 1, 0.15, 0],
        }),
        transform: [
          {
            scale: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.65, 1.3],
            }),
          },
        ],
      }}
    />
  );
}

// ─────────────────────────────────────────────
// Sweep progress bar
// ─────────────────────────────────────────────

function SweepBar() {
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(x, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ).start();
  }, []);

  return (
    <View style={sw.track}>
      <Animated.View
        style={[
          sw.fill,
          {
            left: x.interpolate({
              inputRange: [0, 0.35, 0.7, 1],
              outputRange: [-70, 8, 38, 110],
            }),
            width: x.interpolate({
              inputRange: [0, 0.2, 0.6, 1],
              outputRange: [0, 70, 70, 0],
            }),
          },
        ]}
      />
    </View>
  );
}

const sw = StyleSheet.create({
  track: {
    width: 110,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 1,
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    height: 1,
    backgroundColor: GOLD,
    borderRadius: 1,
    opacity: 0.7,
  },
});

// ─────────────────────────────────────────────
// Logo mark
// ─────────────────────────────────────────────

function LogoMark({ reveal }: { reveal: Animated.Value }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        lm.wrap,
        {
          opacity: reveal,
          transform: [
            {
              scale: reveal.interpolate({
                inputRange: [0, 1],
                outputRange: [0.72, 1],
              }),
            },
          ],
        },
      ]}
    >
      {/* Outer spinning arc */}
      <Animated.View style={[lm.outerRing, { transform: [{ rotate }] }]} />
      {/* Inner static ring */}
      <View style={lm.innerRing} />
      {/* Center box */}
      <View style={lm.centerBox}>
        <Text style={lm.letter}>C</Text>
      </View>
    </Animated.View>
  );
}

const lm = StyleSheet.create({
  wrap: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  outerRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.2,
    borderColor: "transparent",
    borderTopColor: "rgba(196,160,53,0.95)",
    borderRightColor: "rgba(196,160,53,0.35)",
  },
  innerRing: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 0.6,
    borderColor: "rgba(255,255,255,0.25)",
  },
  centerBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
});

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

type Phase = "dark" | "reveal" | "hold";

export default function PageLoader() {
  const [phase, setPhase] = useState<Phase>("dark");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("reveal"), 300);
    const t2 = setTimeout(() => setPhase("hold"), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const revealAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(10)).current;
  const barAnim = useRef(new Animated.Value(0)).current;
  const rayX = useRef(new Animated.Value(-SW * 0.4)).current;

  useEffect(() => {
    if (phase !== "reveal") return;

    // Ray sweep
    Animated.timing(rayX, {
      toValue: SW * 1.6,
      duration: 750,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    }).start();

    // Logo + glow
    Animated.parallel([
      Animated.timing(revealAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.back(1.15)),
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    // Text + bar (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textAnim, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(textY, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(barAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 280);
  }, [phase]);

  const showRipples = phase === "reveal" || phase === "hold";

  return (
    <View style={s.root}>
      {/* Sweep ray */}
      <Animated.View
        style={[s.ray, { transform: [{ translateX: rayX }] }]}
        pointerEvents="none"
      />

      {/* ONE centered container: glow + rings + logo all share the same center point */}
      <View style={s.circle}>
        {/* Glow layers — position absolute, perfectly centered */}
        <Animated.View
          style={[StyleSheet.absoluteFill, s.centerAll, { opacity: glowAnim }]}
          pointerEvents="none"
        >
          <GlowCircle size={320} color={TEAL} opacity={new Animated.Value(1)} />
        </Animated.View>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            s.centerAll,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.55],
              }),
            },
          ]}
          pointerEvents="none"
        >
          <GlowCircle size={200} color={GOLD} opacity={new Animated.Value(1)} />
        </Animated.View>

        {/* Ripple rings — absolute, same center */}
        {showRipples && (
          <>
            <Ring size={200} color="rgba(43,111,94,0.65)" delay={0} />
            <Ring size={158} color="rgba(196,160,53,0.5)" delay={650} />
            <Ring size={120} color="rgba(43,111,94,0.55)" delay={1300} />
          </>
        )}

        {/* Logo — sits right in the center of the circle */}
        <Animated.Image
          source={require("../../../assets/logo-2.png")}
          style={{ width: 110, height: 110, opacity: revealAnim }}
          resizeMode="contain"
        />
      </View>

      {/* Text + bar — below the circle, not affecting its center */}
      <Animated.View
        style={[
          s.textBlock,
          { opacity: textAnim, transform: [{ translateY: textY }] },
        ]}
      >
        <Text style={s.nameMain}>CEIL · El-Oued</Text>
        <View style={s.sep} />
        <Text style={s.nameSub}>مركز التعليم المكثّف للغات</Text>
      </Animated.View>

      <Animated.View style={{ opacity: barAnim, marginTop: 20 }}>
        <SweepBar />
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#060e0a",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    flexDirection: "column",
  },

  ray: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 55,
    backgroundColor: "rgba(255,255,255,0.045)",
    transform: [{ skewX: "-18deg" }],
  },

  circle: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  centerAll: {
    alignItems: "center",
    justifyContent: "center",
  },

  glowWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  textBlock: {
    alignItems: "center",
    gap: 6,
    marginTop: 22,
  },

  nameMain: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 3.5,
  },

  sep: {
    width: 36,
    height: 1,
    backgroundColor: "rgba(196,160,53,0.5)",
    marginVertical: 2,
  },

  nameSub: {
    fontSize: 10,
    color: "rgba(196,160,53,0.72)",
    letterSpacing: 2,
  },
});
