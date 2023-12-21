"use client";
import AppButton from "@/lib/package/global-components/AppButton";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-full">
      <div className="w-full h-full flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="text-5xl text-gray-700 font-semibold">
            Welcome to LVHUY voting system
          </div>
          <div className="text-2xl">Login to create your poll now!</div>

          <Link href="/login" className="mt-6">
            <AppButton title="login" handler={() => {}} />
          </Link>
        </div>
      </div>
    </div>
  );
}
