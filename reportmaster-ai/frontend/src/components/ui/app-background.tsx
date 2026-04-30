import { motion } from "framer-motion";
import { ElegantShape } from "@/components/ui/shape-landing-hero";

export default function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.06] via-transparent to-rose-500/[0.06] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.2}
          width={720}
          height={160}
          rotate={12}
          gradient="from-indigo-500/[0.14]"
          className="left-[-15%] md:left-[-8%] top-[12%] md:top-[18%]"
        />
        <ElegantShape
          delay={0.35}
          width={520}
          height={120}
          rotate={-14}
          gradient="from-rose-500/[0.12]"
          className="right-[-10%] md:right-[-2%] top-[70%] md:top-[74%]"
        />
        <ElegantShape
          delay={0.3}
          width={320}
          height={86}
          rotate={-8}
          gradient="from-violet-500/[0.12]"
          className="left-[4%] md:left-[9%] bottom-[6%] md:bottom-[10%]"
        />
        <ElegantShape
          delay={0.45}
          width={220}
          height={64}
          rotate={18}
          gradient="from-amber-500/[0.10]"
          className="right-[12%] md:right-[18%] top-[8%] md:top-[14%]"
        />
        <ElegantShape
          delay={0.55}
          width={170}
          height={48}
          rotate={-24}
          gradient="from-cyan-500/[0.10]"
          className="left-[18%] md:left-[24%] top-[5%] md:top-[10%]"
        />
      </div>

      <motion.div
        aria-hidden
        className="absolute -top-24 left-1/4 w-[38rem] h-[38rem] rounded-full bg-indigo-500/10 blur-[140px]"
        animate={{ opacity: [0.05, 0.09, 0.05] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-28 right-1/4 w-[40rem] h-[40rem] rounded-full bg-rose-500/10 blur-[150px]"
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />
      <motion.div
        aria-hidden
        className="absolute top-1/4 right-1/3 w-[28rem] h-[28rem] rounded-full bg-violet-500/10 blur-[120px]"
        animate={{ opacity: [0.04, 0.075, 0.04] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
      />
    </div>
  );
}
