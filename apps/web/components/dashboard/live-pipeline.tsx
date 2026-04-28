import { MessageSquare, TrendingUp } from "lucide-react";

import { pipelineItems } from "@/fixtures/dashboard";

interface LivePipelineProps {
  onAddTask: () => void;
}

export function LivePipeline({ onAddTask }: LivePipelineProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Client Activity</h2>
        <div className="flex size-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
          12
        </div>
      </div>

      <div className="space-y-3">
        {pipelineItems.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className={`flex size-10 items-center justify-center rounded-lg ${item.tone}`}>
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-sm font-medium">{item.title}</h3>
                <p className="mb-1 text-xs text-gray-500">{item.description}</p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </div>
            </article>
          );
        })}

        <button
          type="button"
          className="w-full rounded-lg bg-black py-3 text-sm text-white transition-colors hover:bg-gray-800"
        >
          FULL CLIENT ACTIVITY
        </button>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50"
            onClick={onAddTask}
          >
            <TrendingUp className="mx-auto mb-2 size-5 text-orange-500" aria-hidden="true" />
            <span className="text-xs font-medium">Add Task</span>
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
          >
            <MessageSquare className="mx-auto mb-2 size-5 text-indigo-600" aria-hidden="true" />
            <span className="text-xs font-medium">Messages</span>
          </button>
        </div>
      </div>
    </section>
  );
}
