import KitchenBoard from "@/components/KitchenBoard";

export default function KitchenPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-gray-900 text-white p-5 shadow-lg flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-2xl font-black tracking-tight">RestoKitchen <span className="text-amber-400">Display</span></h1>
        <div className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span> Live Synced
          </span>
        </div>
      </header>
      <main>
        <KitchenBoard />
      </main>
    </div>
  );
}
