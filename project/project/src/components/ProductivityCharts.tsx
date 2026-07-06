import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Task, TimeSession } from '../types';

interface ProductivityChartsProps {
  tasks: Task[];
  sessions: TimeSession[];
}

const axisTick = {
  fill: 'currentColor',
};

export function ProductivityCharts({ tasks, sessions }: ProductivityChartsProps) {
  const statusData = [
    {
      name: 'To Do',
      tasks: tasks.filter((task) => task.status === 'todo').length,
    },
    {
      name: 'In Progress',
      tasks: tasks.filter((task) => task.status === 'in_progress').length,
    },
    {
      name: 'Done',
      tasks: tasks.filter((task) => task.status === 'done').length,
    },
  ];

  const getLast7DaysData = () => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);

      return {
        date,
        label: date.toLocaleDateString('en-US', {
          weekday: 'short',
        }),
        hours: 0,
      };
    });

    sessions.forEach((session) => {
      const sessionDate = new Date(session.start_time);
      sessionDate.setHours(0, 0, 0, 0);

      const day = days.find((item) => item.date.getTime() === sessionDate.getTime());

      if (day) {
        day.hours += session.duration / 3600;
      }
    });

    return days.map((day) => ({
      day: day.label,
      hours: Number(day.hours.toFixed(2)),
    }));
  };

  const trackedTimeData = getLast7DaysData();

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Productivity Charts
      </h3>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-5 text-gray-900 shadow-md dark:bg-gray-900 dark:text-gray-100">
          <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Tracked Time Last 7 Days
          </h4>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trackedTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                <XAxis dataKey="day" tick={axisTick} stroke="currentColor" />
                <YAxis tick={axisTick} stroke="currentColor" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(17 24 39)',
                    border: '1px solid rgb(55 65 81)',
                    borderRadius: '0.5rem',
                    color: 'rgb(243 244 246)',
                  }}
                />
                <Bar dataKey="hours" name="Hours" fill="currentColor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-white p-5 text-gray-900 shadow-md dark:bg-gray-900 dark:text-gray-100">
          <h4 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Tasks by Status
          </h4>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                <XAxis dataKey="name" tick={axisTick} stroke="currentColor" />
                <YAxis allowDecimals={false} tick={axisTick} stroke="currentColor" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(17 24 39)',
                    border: '1px solid rgb(55 65 81)',
                    borderRadius: '0.5rem',
                    color: 'rgb(243 244 246)',
                  }}
                />
                <Bar dataKey="tasks" name="Tasks" fill="currentColor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
