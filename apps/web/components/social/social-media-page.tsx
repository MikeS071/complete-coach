import { BarChart3, Calendar, Image, Share2 } from "lucide-react";
import { scheduledPosts, socialAnalytics } from "@/fixtures/operations";

const platformIcon = {
  Instagram: Share2,
  Facebook: Share2,
  Twitter: Share2
};

const platformTone = {
  Instagram: "bg-pink-50 text-pink-600",
  Facebook: "bg-blue-50 text-blue-600",
  Twitter: "bg-sky-50 text-sky-500"
};

export function SocialMediaPage() {
  return (
    <main className="space-y-8 p-6 lg:p-8">
      <header>
        <h1 className="mb-2 text-3xl font-black">Social Media Hub</h1>
        <p className="text-sm text-slate-600">Manage your social presence and track engagement across platforms.</p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {socialAnalytics.map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{stat.label}</span>
              <span className="text-xs font-bold text-green-600">{stat.change}</span>
            </div>
            <div className="text-2xl font-black">{stat.value}</div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">Scheduled Posts</h2>
            <button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700">
              + New Post
            </button>
          </div>
          <div className="space-y-4">
            {scheduledPosts.map((post) => {
              const Icon = platformIcon[post.platform as keyof typeof platformIcon];
              return (
                <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex gap-4">
                    <div className="hidden h-24 w-24 shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-orange-400 sm:block" />
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-bold">{post.platform}</span>
                        <span className={`rounded-md px-2 py-1 text-xs font-bold ${post.status === "scheduled" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="mb-2 text-sm text-slate-700">{post.content}</p>
                      <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {post.scheduled}
                      </span>
                    </div>
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Edit</button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside>
          <h2 className="mb-4 text-xl font-black">Platform Overview</h2>
          <div className="mb-6 space-y-4">
            {(["Instagram", "Facebook", "Twitter"] as const).map((platform) => {
              const Icon = platformIcon[platform];
              return (
                <article key={platform} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${platformTone[platform]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{platform}</div>
                      <div className="text-xs text-slate-500">
                        {platform === "Instagram" ? "12.4K" : platform === "Facebook" ? "8.7K" : "3.2K"} followers
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">Avg. engagement: {platform === "Instagram" ? "8.2%" : platform === "Facebook" ? "5.4%" : "3.1%"}</div>
                </article>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:bg-slate-50">
              <BarChart3 className="mx-auto mb-2 h-5 w-5 text-indigo-600" />
              <span className="text-xs font-bold">Analytics</span>
            </button>
            <button className="rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:bg-slate-50">
              <Image className="mx-auto mb-2 h-5 w-5 text-purple-600" />
              <span className="text-xs font-bold">Media</span>
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
