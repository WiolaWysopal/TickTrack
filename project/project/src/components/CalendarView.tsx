import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

import type { Task } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface CalendarViewProps {
  tasks: Task[];
  selectedProjectId: string | null;
  onSelectTask: (taskId: string) => void;
  onUpdateTask: (
    taskId: string,
    updates: {
      status?: string;
      priority?: string;
    }
  ) => void;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarView({
  tasks,
  selectedProjectId,
  onSelectTask,
  onUpdateTask,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));

  const today = startOfDay(new Date());

  const projectTasks = useMemo(() => {
    if (!selectedProjectId) {
      return [];
    }

    return tasks.filter((task) => task.project_id === selectedProjectId);
  }, [tasks, selectedProjectId]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
    });
  }, [currentMonth]);

  const getTasksForDate = (date: Date) => {
    return projectTasks.filter((task) => {
      if (!task.due_date) {
        return false;
      }

      return isSameDay(parseISO(task.due_date), date);
    });
  };

  const isTaskOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'done') {
      return false;
    }

    return isBefore(startOfDay(parseISO(task.due_date)), today);
  };

  const selectedDateTasks = useMemo(() => {
    return getTasksForDate(selectedDate);
  }, [projectTasks, selectedDate]);

  const selectedDateOverdueTasks = selectedDateTasks.filter(isTaskOverdue).length;
  const selectedDateDoneTasks = selectedDateTasks.filter((task) => task.status === 'done').length;

  const goToPreviousMonth = () => {
    setCurrentMonth((month) => subMonths(month, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((month) => addMonths(month, 1));
  };

  const goToToday = () => {
    const currentDate = startOfDay(new Date());

    setCurrentMonth(startOfMonth(currentDate));
    setSelectedDate(currentDate);
  };

  if (!selectedProjectId) {
    return (
      <Card className="mb-8 border-white/60 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
        <CardContent className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
            <CalendarDays className="h-6 w-6" />
          </div>

          <h2 className="text-lg font-semibold">Calendar</h2>

          <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
            Select a project to view its task deadlines in the calendar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
      <Card className="min-w-0 overflow-hidden border-white/60 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
        <CardHeader className="gap-4 border-b border-gray-200/70 px-4 py-4 dark:border-gray-700/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Calendar
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>

            <div className="flex items-center rounded-lg border bg-white/70 p-1 dark:border-gray-700 dark:bg-gray-950/40">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousMonth}
                aria-label="Previous month"
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <p className="min-w-32 px-2 text-center text-sm font-semibold sm:min-w-36 sm:text-base">
                {format(currentMonth, 'MMMM yyyy')}
              </p>

              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                aria-label="Next month"
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-5">
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-7">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="border-b border-r border-gray-200 bg-gray-100/80 px-1 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 last:border-r-0 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400 sm:text-xs"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((day, index) => {
                const dayTasks = getTasksForDate(day);
                const overdueTasks = dayTasks.filter(isTaskOverdue);
                const doneTasks = dayTasks.filter((task) => task.status === 'done');

                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, today);
                const belongsToCurrentMonth = isSameMonth(day, currentMonth);
                const hasOverdueTasks = overdueTasks.length > 0;
                const hasDoneTasks = doneTasks.length > 0;

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`relative min-h-16 border-b border-r border-gray-200 p-1.5 text-left transition-all hover:z-10 hover:bg-blue-50/80 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:border-gray-700 dark:hover:bg-gray-800 sm:min-h-24 sm:p-2 lg:min-h-28 ${
                      index % 7 === 6 ? 'border-r-0' : ''
                    } ${
                      !belongsToCurrentMonth
                        ? 'bg-gray-50/60 text-gray-400 dark:bg-gray-950/40 dark:text-gray-600'
                        : 'bg-white dark:bg-gray-900'
                    } ${hasOverdueTasks ? 'bg-red-50/80 dark:bg-red-950/20' : ''} ${
                      isSelected ? 'z-10 ring-2 ring-inset ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:text-sm ${
                          isToday
                            ? 'bg-blue-600 text-white shadow-sm'
                            : belongsToCurrentMonth
                              ? 'text-gray-800 dark:text-gray-100'
                              : ''
                        }`}
                      >
                        {format(day, 'd')}
                      </span>

                      {dayTasks.length > 0 && (
                        <span
                          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                            hasOverdueTasks
                              ? 'bg-red-500 text-white'
                              : hasDoneTasks && doneTasks.length === dayTasks.length
                                ? 'bg-emerald-500 text-white'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 hidden space-y-1 sm:block">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          title={task.name}
                          className={`truncate rounded-md px-1.5 py-1 text-[11px] font-medium ${
                            isTaskOverdue(task)
                              ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : task.status === 'done'
                                ? 'bg-emerald-100 text-emerald-700 line-through dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {task.name}
                        </div>
                      ))}

                      {dayTasks.length > 2 && (
                        <p className="px-1 text-[10px] font-medium text-gray-500 dark:text-gray-400">
                          +{dayTasks.length - 2} more
                        </p>
                      )}
                    </div>

                    {dayTasks.length > 0 && (
                      <div className="mt-2 flex gap-1 sm:hidden">
                        {hasOverdueTasks && <span className="h-2 w-2 rounded-full bg-red-500" />}

                        {dayTasks.some((task) => task.status !== 'done') && !hasOverdueTasks && (
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                        )}

                        {hasDoneTasks && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              Tasks
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Overdue
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Completed
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit min-w-0 border-white/60 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-gray-900/70 xl:sticky xl:top-6">
        <CardHeader className="border-b border-gray-200/70 px-5 py-4 dark:border-gray-700/70">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{format(selectedDate, 'MMMM d, yyyy')}</CardTitle>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {selectedDateTasks.length === 0
                  ? 'No scheduled tasks'
                  : `${selectedDateTasks.length} ${
                      selectedDateTasks.length === 1 ? 'task' : 'tasks'
                    } scheduled`}
              </p>
            </div>

            {selectedDateTasks.length > 0 && (
              <div className="flex shrink-0 gap-2">
                {selectedDateOverdueTasks > 0 && (
                  <span
                    className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300"
                    title="Overdue tasks"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {selectedDateOverdueTasks}
                  </span>
                )}

                {selectedDateDoneTasks > 0 && (
                  <span
                    className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    title="Completed tasks"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {selectedDateDoneTasks}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {selectedDateTasks.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center dark:border-gray-700">
              <CalendarDays className="mb-3 h-8 w-8 text-gray-400" />

              <p className="font-medium text-gray-700 dark:text-gray-200">
                No tasks due on this day
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select another date to view scheduled tasks.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {selectedDateTasks.map((task) => {
                const overdue = isTaskOverdue(task);
                const completed = task.status === 'done';

                return (
                  <li
                    key={task.id}
                    className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${
                      overdue
                        ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
                        : completed
                          ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20'
                          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onSelectTask(task.id)}
                          className="min-w-0 text-left"
                        >
                          <p
                            className={`break-words font-semibold transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                              completed
                                ? 'text-gray-500 line-through dark:text-gray-400'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {task.name}
                          </p>
                        </button>

                        {overdue && (
                          <span className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                            Overdue
                          </span>
                        )}

                        {completed && (
                          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Done
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="break-words text-sm leading-6 text-gray-600 dark:text-gray-300">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <StatusBadge
                          value={task.status}
                          onChange={(status) => onUpdateTask(task.id, { status })}
                        />

                        <PriorityBadge
                          value={task.priority}
                          onChange={(priority) => onUpdateTask(task.id, { priority })}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
