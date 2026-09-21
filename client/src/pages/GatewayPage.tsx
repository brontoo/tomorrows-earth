import { Link } from "wouter";

const cardBase =
  "flex w-full max-w-md flex-1 flex-col items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-10 text-center backdrop-blur-md transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/30";

const buttonBase =
  "mt-10 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#2f9e76] via-[#19b6c8] to-[#2563eb] px-8 py-4 text-base font-extrabold uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 hover:shadow-2xl";

export default function GatewayPage() {
  return (
    <main
      className="flex min-h-screen w-full items-center justify-center bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/images/gateway-bg.jpg')" }}
    >
      <div className="flex w-full max-w-5xl flex-col items-stretch justify-center gap-6 md:flex-row">
        <Link href="/choose-role?redirect=/expo" className={cardBase}>
          <h2 className="text-4xl font-extrabold leading-tight text-white drop-shadow-lg md:text-5xl">
            Tomorrow Earth Expo 2027
          </h2>
          <span className={buttonBase}>Explore Projects</span>
        </Link>

        <Link href="/choose-role?redirect=/missions" className={cardBase}>
          <h2 className="text-4xl font-extrabold leading-tight text-white drop-shadow-lg md:text-5xl">
            Gamified Missions
          </h2>
          <span className={buttonBase}>Start Journey</span>
        </Link>
      </div>
    </main>
  );
}