import { UserRoundPlus, Megaphone, ShieldCheck, HeartHandshake, ArrowUpRight } from "lucide-react";
import { communityPages } from "@/lib/community/config";
const icons = { register: UserRoundPlus, incident: Megaphone, whistleblower: ShieldCheck, donation: HeartHandshake };
export default function CommunitySection() {
  return <section id="community" aria-labelledby="community-heading" className="container-page py-12 sm:py-16 scroll-mt-36">
    <div className="max-w-2xl mb-8"><p className="text-gold text-xs tracking-widest uppercase font-semibold mb-3">More than merchandise</p>
      <h2 id="community-heading" className="font-display text-3xl sm:text-4xl mb-4">Get involved. Make a difference.</h2>
      <p className="text-ink-soft leading-relaxed">Choose how you would like to help your community. Join in, raise a concern, share information or offer essential items.</p></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {Object.entries(communityPages).map(([kind, page], index) => { const Icon = icons[kind as keyof typeof icons]; return <article key={kind} className="rounded-2xl border border-ink/20 bg-blush p-6 sm:p-8 flex flex-col">
        <div className="flex items-center justify-between mb-6"><Icon className="h-7 w-7 text-gold" aria-hidden="true" /><span className="text-xs text-ink-soft">0{index+1}</span></div>
        <h3 className="font-display text-2xl mb-3">{page.title}</h3><p className="text-ink-soft text-sm leading-relaxed mb-6 flex-1">{page.description}</p>
        <a href={page.href} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-full bg-rose text-cream px-5 py-3 font-semibold hover:bg-[#ed6666]">{page.action}<ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" /></a>
      </article>; })}
    </div>
  </section>;
}
