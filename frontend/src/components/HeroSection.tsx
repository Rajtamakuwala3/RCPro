"use client";
import { MaskContainer } from "@/components/ui/svg-mask-effect";


export function HeroSection() {
  return (
    <div className="flex h-screen w-full items-center justify-center overflow-hidden">
      <MaskContainer
        revealText={
          <p className="mx-auto max-w-4xl text-center text-6xl font-extrabold text-slate-800 dark:text-white">
            Krupa Auto Gas
          </p>
        }
        className="h-screen w-full text-white dark:text-black"
      >
        <div className="text-center text-3xl font-semibold leading-relaxed">
          <span className="text-[#C62828]">Krupa Auto Gas</span>
          <br />
          <span className="text-[#2ECC71]">
            Vanaz Authorized Service Center
          </span>
          <br />
          <span className="text-blue-500">
            One Stop Solution for all your CNG related Problem.
          </span>
          <br />
          <span className="text-[#C62828]">Contact Raju Bhai - 9898576477</span>
        </div>
      </MaskContainer>
    </div>
  );
}
